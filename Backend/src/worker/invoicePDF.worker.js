import { Worker } from "bullmq";

import invoiceRepository from "../repository/invoice/invoice.repository.js";
import generateInvoicePDF from "../utils/generateInvoicePDF.js";
import { encryptBuffer } from "../utils/encryption.js";

import redis from "../config/redis.js";
import logger from "../utils/logger.js";

const invoicePDFWorker = new Worker(
    "invoice-pdf",

    async (job) => {
        const { userId, invoiceId, updatedAtTime } = job.data;

        logger.info(`Processing PDF job: ${job.id}`);

        // 1. Get invoice
        const invoice = await invoiceRepository.findById(userId, invoiceId);

        if (!invoice) {
            throw new Error("Invoice not found");
        }

        // 2. Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoice);

        // 3. Create Redis cache key
        const cacheKey = `invoice:pdf:${userId}:${invoiceId}:${updatedAtTime}`;

        // 4. Encrypt and store PDF in Redis for 1 hour
        const encryptedPDF = encryptBuffer(pdfBuffer);

        await redis.set(cacheKey, encryptedPDF, "EX", 3600);

        logger.info(`PDF generated, encrypted, and cached: ${invoice.invoiceNumber}`);

        return {
            invoiceNumber: invoice.invoiceNumber,
        };
    },

    {
        connection: redis,
        concurrency: 5,
    }
);

invoicePDFWorker.on("completed", (job) => {
    logger.info(`PDF job completed: ${job.id}`);
});

invoicePDFWorker.on("failed", (job, error) => {
    logger.error({
        message: "PDF job failed",
        jobId: job?.id,
        error: error.message,
        stack: error.stack,
    });
});

export default invoicePDFWorker;
