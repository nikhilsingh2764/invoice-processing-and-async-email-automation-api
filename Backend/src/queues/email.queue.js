import "dotenv/config";
import { Queue } from "bullmq";
import redis from "../config/redis.js";
import logger from "../utils/logger.js";

export const emailQueue = new Queue("send-email", {
    connection: redis,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 5000,
        },

        removeOnComplete: {
            age: 3600,
            count: 100,
        },
        removeOnFail: {
            age: 2 * 3600,
            count: 100,
        },
    },
});

emailQueue.on("error", (err) => {
    logger.error(`Email Queue Error: ${err.message}`);
});