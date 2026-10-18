import "dotenv/config";

// Validate required environment variables at startup
const requiredEnvVars = [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "BREVO_API_KEY",
    "EMAIL_USER",
    "CLIENT_URL",
];

const missingEnvVars = requiredEnvVars.filter(
    (key) => !process.env[key] || process.env[key].trim() === ""
);
if (missingEnvVars.length > 0) {
    console.error(
        `❌ Startup Error: Missing required environment variables in .env: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
}

import app from "./app.js";
import connectDB from "./config/db.js";
import redis from "./config/redis.js";
import gracefulShutdown from "./utils/gracefulShutdown.js";
import logger from "./utils/logger.js";

// ==========================================
// Process-Level Error Handlers
// ==========================================
process.on("uncaughtException", (error) => {
    logger.error({
        message: "Uncaught Exception detected! Shutting down process...",
        error: error.message,
        stack: error.stack,
    });
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
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
        logger.error("Server failed to start:", error.message);
        process.exit(1);
    }
};

startServer();
