import mongoose from "mongoose";
import logger from "./logger.js";


let isShuttingDown = false;


const gracefulShutdown = async ({
    server,
    redis,
    workers = []
}) => {

    // Prevent multiple shutdown calls
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    logger.info("Graceful shutdown started...");

    // 1. Stop accepting new requests
    server.close(() => {
        logger.info("HTTP server closed");
    });


    // 2. Close BullMQ workers
    for (const worker of workers) {
        await worker.close();
    }

    logger.info("Workers closed");


    // 3. Close Redis
    await redis.quit();

    logger.info("Redis connection closed");


    // 4. Close MongoDB
    await mongoose.connection.close();

    logger.info("MongoDB connection closed");


    logger.info("Graceful shutdown completed");

    process.exit(0);
};


export default gracefulShutdown;