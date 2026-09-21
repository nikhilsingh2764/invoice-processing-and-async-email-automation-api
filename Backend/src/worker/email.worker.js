import "dotenv/config";


import logger from "../utils/logger.js";
import { Worker } from "bullmq";
import sendEmail from "../service/auth/email.service.js";
import redis from "../config/redis.js";


const emailWorker = new Worker("send-email", async (job) => {

    console.log("🔥 JOB RECEIVED:", job.id);
    console.log("🔥 JOB DATA:", job.data);

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


// Worker error
emailWorker.on("error", (error) => {

    logger.error({
        message: "Email worker error",
        error: error.message,
        stack: error.stack
    });

});


// Graceful shutdown
const shutdown = async () => {

    logger.info("Shutting down email worker...");

    await emailWorker.close();

    logger.info("Email worker stopped");

    process.exit(0);
};


process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);


logger.info("Email worker started");


export default emailWorker;