
import "dotenv/config";
import { Queue } from "bullmq";

import redis from "../config/redis.js";

console.log("queue-is ready");

export const emailQueue = new Queue("send-email", {
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