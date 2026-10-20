import "dotenv/config";
import { Worker } from "bullmq";
import redis from "../config/redis.js";
import invoiceRepository from "../repository/invoice/invoice.repository.js";
import logger from "../utils/logger.js";

const overdueWorker = new Worker(
    "overdue-queue",
    async (job) => {
        logger.info(`Processing overdue invoice check: ${job.id}`);

        // Fetch invoices that are due and need to be marked as overdue
        const overdueInvoices = await invoiceRepository.findInvoicesNeedingOverdueStatus();

        if (!overdueInvoices || overdueInvoices.length === 0) {
            logger.info("No invoices found to mark as overdue.");
            return { processedCount: 0 };
        }

        let processedCount = 0;

        for (const invoice of overdueInvoices) {
            const userId = invoice.userId.toString();
            const invoiceId = invoice._id.toString();

            // 1. Update invoice status to Overdue in the database
            await invoiceRepository.updateById(userId, invoiceId, { status: "Overdue" });

            // 2. Clear Redis cache to prevent stale data
            await redis.del(`invoice:${invoiceId}:${userId}`);
            await redis.del(`invoice:pdf:${userId}:${invoiceId}`);

            processedCount++;
            logger.info(`Invoice ${invoiceId} marked as overdue and Redis cache cleared.`);
        }

        return { processedCount };
    },
    {
        connection: redis,
        concurrency: 1,
    }
);

overdueWorker.on("completed", (job) => {
    logger.info(`Overdue invoice worker job completed: ${job.id}`);
});

overdueWorker.on("failed", (job, error) => {
    logger.error({
        message: "ALERT: Overdue invoice worker job failed!",
        jobId: job?.id,
        error: error.message,
        stack: error.stack,
    });
});

export default overdueWorker;