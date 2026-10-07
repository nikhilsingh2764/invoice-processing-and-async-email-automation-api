import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

console.log("Connecting to Redis at:", redisUrl);

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false, // Required for BullMQ
});

redis.on("connect", () => console.log("Redis connected successfully"));
redis.on("error", (err) => console.error("Redis connection error:", err));

export default redis;