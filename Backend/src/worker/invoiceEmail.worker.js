import "dotenv/config";
import { Worker, UnrecoverableError } from "bullmq";

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

        // Find invoice via repository
        const invoice = await invoiceRepository.findById(userId, invoiceId);

        if (!invoice) {
            logger.error(`Invoice not found: ${invoiceId}`);
            throw new Error(`Invoice not found: ${invoiceId}`);
        }

        // --- IDEMPOTENCY CHECK ---
        if (invoice.sent) {
            logger.info(
                `Invoice ${invoice.invoiceNumber} has already been sent. Skipping duplicate job/email.`
            );
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
            senderName: invoice.business?.businessName,
            replyTo: invoice.business?.email,
            attachments: [
                {
                    content: pdfBuffer.toString("base64"),
                    name: `${invoice.invoiceNumber}.pdf`,
                },
            ],
        });

        // --- MARK AS SENT VIA REPOSITORY ---
        // Assuming your repository has an update method (e.g., updateById, update, or updateStatus)
        await invoiceRepository.updateById(userId, invoiceId, { sent: true });

        logger.info(`Invoice email sent: ${invoice.invoiceNumber}`);

        return { invoiceNumber: invoice.invoiceNumber };
    },
    {
        connection: redis,
        concurrency: 5,
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
        stack: error.stack,
    });
});

export default invoiceEmailWorker;
