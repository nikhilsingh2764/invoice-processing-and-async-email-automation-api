import "./config/env.js"; // loads .env and validates required variables (must stay the first import)

import app from "./app.js";
import connectDB from "./config/db.js";
import redis from "./config/redis.js";
import { TRANSIENT_SOCKET_ERROR_CODES } from "./config/env.js";
import gracefulShutdown from "./utils/gracefulShutdown.js";
import logger from "./utils/logger.js";

// ==========================================
// Process-Level Error Handlers
// ==========================================
process.on("uncaughtException", (error) => {
    // Redis/BullMQ socket drops are retried automatically; do not crash the API for them.
    if (TRANSIENT_SOCKET_ERROR_CODES.includes(error?.code)) {
        logger.warn(`Ignored transient socket error: ${error.code}`);
        return;
    }

    logger.error({
        message: "Uncaught Exception detected! Shutting down process...",
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    logger.error({
        message: "Unhandled Promise Rejection detected! Shutting down process...",
        reason: reason?.message || reason,
        stack: reason?.stack,
    });
    process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, "0.0.0.0", () => {
            logger.info(`server is running at port ${PORT} `);
            logger.info(`http://localhost:${PORT}`);
        });

        // Shutdown trigger handler (No workers in web process anymore)
        const shutdownHandler = (signal) => {
            logger.info(`Received ${signal}.`);

            gracefulShutdown({
                server,
                redis,
                workers: [], // Empty array since workers run in their own process
            }).catch((err) => {
                logger.error(`Error during graceful shutdown: ${err.message}`);
                process.exit(1);
            });
        };

        process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
        process.on("SIGINT", () => shutdownHandler("SIGINT"));
    } catch (error) {
        logger.error(`Server failed to start: ${error.message}`);
        process.exit(1);
    }
};

startServer();
