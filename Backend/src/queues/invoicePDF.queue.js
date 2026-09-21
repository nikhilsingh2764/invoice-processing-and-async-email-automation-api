import "dotenv/config";
import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const invoicePDFQueue = new Queue("invoice-pdf", {
    connection: redis,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
            type: "exponential",
            delay: 5000,
        },

        removeOnComplete: 100,
        removeOnFail: 100,
    },
});