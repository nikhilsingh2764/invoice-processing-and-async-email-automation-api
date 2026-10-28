import mongoose from "mongoose";
import logger from "./logger.js";

let isShuttingDown = false;

const SHUTDOWN_TIMEOUT_MS = 15000;

// Resolves when the HTTP server has finished all in-flight requests.
const closeServer = (server) =>
    new Promise((resolve) => {
        if (!server) return resolve();

        server.close(() => {
            logger.info("HTTP server closed");
            resolve();
        });

        // Drop idle keep-alive sockets so close() can finish quickly (Node >= 18.2).
        server.closeIdleConnections?.();
    });

const gracefulShutdown = async ({ server, redis, workers = [] }) => {
    // Prevent multiple shutdown calls
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    logger.info("Graceful shutdown started...");

    // Safety net: never hang forever (container orchestrators send SIGKILL after a grace period)
    const forceExitTimer = setTimeout(() => {
        logger.error("Graceful shutdown timed out. Forcing exit.");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExitTimer.unref();

    // 1. Stop accepting new requests and wait for in-flight ones to finish
    await closeServer(server);

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
