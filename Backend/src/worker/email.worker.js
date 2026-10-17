import "dotenv/config";

import logger from "../utils/logger.js";
import { Worker } from "bullmq";
import sendEmail from "../service/auth/email.service.js";
import redis from "../config/redis.js";

const emailWorker = new Worker("send-email", async (job) => {
    const {
        to,
        subject,
        html,
        language = "en"
    } = job.data;

    logger.info(`Processing email job: ${job.id}`);

    // Send email through Brevo
    await sendEmail({
        to,
        subject,
        html,
        language
    });

    logger.info(`Email sent successfully: ${to}`);

    return {
        to,
        subject
    };
},
{
    connection: redis,
    concurrency: 5
}
);

// Job completed
emailWorker.on("completed", (job) => {
    logger.info(`Email job completed: ${job.id}`);
});

// Job failed
emailWorker.on("failed", (job, error) => {
    logger.error({
        message: "Email job failed",
        jobId: job?.id,
        error: error.message,
        stack: error.stack
    });
});

// Worker error (Filtered to ignore socket connection drops)
emailWorker.on("error", (error) => {
    if (["ECONNRESET", "EPIPE", "ETIMEDOUT", "ECONNREFUSED"].includes(error.code)) {
        return; // Silently skip network drop log spam; BullMQ/ioredis reconnect automatically
    }

    logger.error({
        message: "Email worker error",
        error: error.message,
        stack: error.stack
    });
});

logger.info("Email worker started");

export default emailWorker;