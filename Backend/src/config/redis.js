import Redis from "ioredis";
import logger from "../utils/logger.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    keepAlive: 30000,
    retryStrategy(times) {
        return Math.min(times * 100, 2000);
    },
});

// Attach error handler immediately to prevent uncaught exception crashes
redis.on("error", (err) => {
    if (["ECONNRESET", "EPIPE", "ETIMEDOUT", "ECONNREFUSED"].includes(err.code)) {
        return; // Silently ignore network drops
    }
    logger.error({ message: "Redis connection error", error: err.message });
});

redis.on("ready", () => {
    logger.info("Redis connected successfully");
});

// Catch any stray unhandled socket errors from BullMQ internal client streams globally
process.on("uncaughtException", (err) => {
    if (err.code === "EPIPE" || err.code === "ECONNRESET") {
        return; // Suppress background Redis socket drops safely
    }
    // Re-throw other critical uncaught exceptions
    console.error(err);
    process.exit(1);
});

export default redis;
