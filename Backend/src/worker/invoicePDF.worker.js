import { Worker } from "bullmq";

import invoiceRepository from "../repository/invoice/invoice.repository.js";
import generateInvoicePDF from "../utils/generateInvoicePDF.js";

import redis from "../config/redis.js";
import logger from "../utils/logger.js";


const invoicePDFWorker = new Worker(
    "invoice-pdf",

    async (job) => {

        const { userId, invoiceId } = job.data;

        logger.info(`Processing PDF job: ${job.id}`);

        // 1. Get invoice
        const invoice = await invoiceRepository.findById(
            userId,
            invoiceId
        );

        if (!invoice) {
            throw new Error("Invoice not found");
        }

        // 2. Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoice);

        // 3. Create Redis cache key
        const cacheKey = `invoice:pdf:${userId}:${invoiceId}`;

        // 4. Store PDF in Redis for 1 hour
        await redis.set(
            cacheKey,
            pdfBuffer,
            "EX",
            3600
        );

        logger.info(`PDF generated and cached: ${invoice.invoiceNumber}`);

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
        stack: error.stack
    });



});

export default invoicePDFWorker;