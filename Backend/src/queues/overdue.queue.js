import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const overdueQueue = new Queue("overdue-queue", { connection: redis });

// Schedule the repeatable job to run every day at midnight
export const scheduleOverdueJob = async () => {
    await overdueQueue.add(
        "check-overdue-invoices",
        {},
        {
            repeat: {
                pattern: "0 0 * * *", // Runs every day at 00:00 (midnight)
            },
            removeOnComplete: true,
            removeOnFail: true,
        }
    );
};
