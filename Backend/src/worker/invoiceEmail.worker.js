import "dotenv/config";
import { Worker } from "bullmq";

import redis from "../config/redis.js";
import invoiceRepository from "../repository/invoice/invoice.repository.js";
import generateInvoicePDF from "../utils/generateInvoicePDF.js";
import generateInvoiceEmailContent from "../utils/generateInvoiceEmailContent.js";
import sendEmail from "../service/auth/email.service.js";
import logger from "../utils/logger.js";

const invoiceEmailWorker = new Worker(
    "invoice-email",
    async (job) => {
        const { userId, invoiceId } = job.data;

        logger.info(`Processing invoice email job: ${job.id}`);

        // 1. Find invoice
        const invoice = await invoiceRepository.findById(userId, invoiceId);

        if (!invoice) {
            throw new Error("Invoice not found");
        }

        // 2. Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoice);

        // 3. Build email (subject + HTML)
        const { subject, body } = generateInvoiceEmailContent(invoice);

        // 4. Send email with PDF attached
        logger.info(
            `Sending invoice email: invoice=${invoice.invoiceNumber} to=${invoice.customer.email} ` +
            `from=${process.env.EMAIL_USER} subject="${subject}" pdfKB=${Math.round(pdfBuffer.length / 1024)}`
        );

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
        message: "Invoice email job failed",
        jobId: job?.id,
        error: error.message,
        reason: error.errors,   // Brevo's real error (status + message)
        stack: error.stack
    });
});

export default invoiceEmailWorker;