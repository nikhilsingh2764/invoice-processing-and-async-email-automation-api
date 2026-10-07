import mongoose from "mongoose";
import redis from "../../config/redis.js";

export const healthCheck = async (req, res) => {
    const mongoStatus =
        mongoose.connection.readyState === 1;

    let redisStatus = false;

    try {
        const result = await redis.ping();
        redisStatus = result === "PONG";
    } catch (error) {
        redisStatus = false;
    }

    const isHealthy =
        mongoStatus && redisStatus;

    return res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: isHealthy ? "UP" : "DOWN",

        services: {
            api: "UP",
            mongodb: mongoStatus ? "UP" : "DOWN",
            redis: redisStatus ? "UP" : "DOWN"
        },

        timestamp: new Date().toISOString()
    });
};

export const livenessCheck = (req, res) => {
    return res.status(200).json({
        success: true,
        status: "UP",
        timestamp: new Date().toISOString()
    });
};


export const readinessCheck = async (req, res) => {

    const mongoStatus =
        mongoose.connection.readyState === 1;

    let redisStatus = false;

    try {
        redisStatus =
            (await redis.ping()) === "PONG";
    } catch (error) {
        redisStatus = false;
    }

    const ready =
        mongoStatus && redisStatus;

    return res.status(ready ? 200 : 503).json({
        success: ready,
        status: ready ? "READY" : "NOT_READY",

        services: {
            mongodb: mongoStatus ? "UP" : "DOWN",
            redis: redisStatus ? "UP" : "DOWN"
        },

        timestamp: new Date().toISOString()
    });
};