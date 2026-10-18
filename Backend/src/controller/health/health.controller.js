import mongoose from "mongoose";
import redis from "../../config/redis.js";

// Light liveness probe (Container is running)
export const livenessCheck = (req, res) => {
    return res.status(200).json({
        success: true,
        status: "UP",
        timestamp: new Date().toISOString(),
    });
};

// Detailed readiness / health check (Dependencies are up)
export const readinessCheck = async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1;
    let redisStatus = false;

    try {
        redisStatus = (await redis.ping()) === "PONG";
    } catch (error) {
        redisStatus = false;
    }

    const ready = mongoStatus && redisStatus;

    return res.status(ready ? 200 : 503).json({
        success: ready,
        status: ready ? "READY" : "NOT_READY",
        services: {
            api: "UP",
            mongodb: mongoStatus ? "UP" : "DOWN",
            redis: redisStatus ? "UP" : "DOWN",
        },
        timestamp: new Date().toISOString(),
    });
};

// Alias healthCheck to readinessCheck if they serve the same deep check purpose
export const healthCheck = readinessCheck;
