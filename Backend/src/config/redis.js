import Redis from "ioredis";
import logger from "../utils/logger.js";
import { TRANSIENT_SOCKET_ERROR_CODES } from "./env.js";

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
    if (TRANSIENT_SOCKET_ERROR_CODES.includes(err.code)) {
        return; // Silently ignore network drops (ioredis reconnects automatically)
    }
    logger.error({ message: "Redis connection error", error: err.message });
});

redis.on("ready", () => {
    logger.info("Redis connected successfully");
});

export default redis;
