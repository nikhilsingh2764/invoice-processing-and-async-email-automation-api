import { Worker } from "bullmq";
import redis from "../config/redis.js";
import Invoice from "../model/invoice/invoice.model.js";
import logger from "../utils/logger.js";

const overdueWorker = new Worker(
    "overdue-queue",
    async (job) => {
        logger.info("Running daily overdue invoice status check...");

        const now = new Date();

        // Find all Pending invoices where dueDate is in the past
        const result = await Invoice.updateMany(
            {
                status: "Pending",
                dueDate: { $lt: now },
            },
            {
                $set: { status: "Overdue" },
            }
        );

        logger.info(`Overdue check complete. Updated ${result.modifiedCount} invoices to Overdue.`);
    },
    { connection: redis }
);

overdueWorker.on("failed", (job, err) => {
    logger.error(`Overdue worker job failed: ${err.message}`);
});

export default overdueWorker;
