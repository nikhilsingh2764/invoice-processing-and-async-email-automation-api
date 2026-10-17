import "dotenv/config";
import { Worker, UnrecoverableError } from "bullmq";

import redis from "../config/redis.js";
import invoiceRepository from "../repository/invoice/invoice.repository.js";
import Invoice from "../model/invoice/invoice.model.js"; // <-- Add this import
import generateInvoicePDF from "../utils/generateInvoicePDF.js";
import generateInvoiceEmailContent from "../utils/generateInvoiceEmailContent.js";
import sendEmail from "../service/auth/email.service.js";
import logger from "../utils/logger.js";

const invoiceEmailWorker = new Worker("invoice-email", async (job) => {

    const { userId, invoiceId } = job.data;

    logger.info(`Processing invoice email job: ${job.id}`);

    // Find invoice
    const invoice = await invoiceRepository.findById(userId, invoiceId);

    if (!invoice) {
        throw new UnrecoverableError("Invoice not found"); // <-- Use UnrecoverableError here
    }

    if (!invoice) {
        throw new Error("Invoice not found");
    }

    // --- ADD IDEMPOTENCY CHECK HERE ---
    if (invoice.sent) {
        logger.info(`Invoice ${invoice.invoiceNumber} has already been sent. Skipping duplicate job/email.`);
        return { invoiceNumber: invoice.invoiceNumber, skipped: true };
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Build email (subject + HTML)
    const { subject, body } = generateInvoiceEmailContent(invoice);


    await sendEmail({
        to: invoice.customer.email,
        subject,
        html: body,
        senderName: invoice.business?.businessName, // business name shows in the inbox
        replyTo: invoice.business?.email,           // customer replies go to the business
        attachments: [
            {
                content: pdfBuffer.toString("base64"),
                name: `${invoice.invoiceNumber}.pdf`
            }
        ]
    });

    // --- MARK AS SENT ATOMICALLY / PERSIST STATE ---
    await Invoice.updateOne({ _id: invoiceId, userId }, { $set: { sent: true } });

    logger.info(`Invoice email sent: ${invoice.invoiceNumber}`);

    return { invoiceNumber: invoice.invoiceNumber };
},
    {
        connection: redis,
        concurrency: 5
    }
);

invoiceEmailWorker.on("completed", (job) => {
    logger.info(`Invoice email job completed: ${job.id}`);
});

invoiceEmailWorker.on("failed", (job, error) => {
    logger.error({
        message: "ALERT: Invoice email job failed permanently or exhausted all retries!",
        jobId: job?.id,
        data: job?.data,
        error: error.message,
        reason: error.errors,
        stack: error.stack
    });
});

export default invoiceEmailWorker;