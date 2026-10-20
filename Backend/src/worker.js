import "dotenv/config";
import redis from "./config/redis.js";
import { scheduleOverdueJob } from "./queues/overdue.queue.js";
import overdueWorker from "./worker/overdue.worker.js";
import emailWorker from "./worker/email.worker.js";
import invoicePDFWorker from "./worker/invoicePDF.worker.js";
import invoiceEmailWorker from "./worker/invoiceEmail.worker.js";
import logger from "./utils/logger.js";
import connectDB from "./config/db.js";

// Process-Level Error Handlers for Worker Process
process.on("uncaughtException", (error) => {
    logger.error({
        message: "Uncaught Exception in Worker process! Shutting down...",
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error({
        message: "Unhandled Promise Rejection in Worker process! Shutting down...",
        reason: reason?.message || reason,
        stack: reason?.stack,
    });
    process.exit(1);
});

const startWorkers = async () => {
    try {
        logger.info("Connecting to MongoDB for background workers...");

        await connectDB();

        logger.info("MongoDB connected successfully.");

        logger.info("Starting background worker process...");

        await scheduleOverdueJob();

        const workers = [emailWorker, invoicePDFWorker, invoiceEmailWorker, overdueWorker];
        logger.info(`Successfully initialized ${workers.length} background workers.`);

        const shutdownHandler = async (signal) => {
            logger.info(`Worker process received ${signal}. Shutting down workers gracefully...`);
            try {
                // Close all workers cleanly
                await Promise.all(workers.map((worker) => worker.close()));
                await redis.quit();
                logger.info("Workers and Redis connection closed successfully.");
                process.exit(0);
            } catch (err) {
                logger.error(`Error during worker graceful shutdown: ${err.message}`);
                process.exit(1);
            }
        };

        process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
        process.on("SIGINT", () => shutdownHandler("SIGINT"));
    } catch (error) {
        logger.error("Background workers failed to start:", error.message);
        process.exit(1);
    }
};

startWorkers();
