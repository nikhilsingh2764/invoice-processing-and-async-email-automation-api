import winston from "winston";
import { AsyncLocalStorage } from "async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage();

const requestIdFormat = winston.format((info) => {
    const store = asyncLocalStorage.getStore();
    if (store && store.requestId) {
        info.requestId = store.requestId;
    }
    return info;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: winston.format.combine(
        requestIdFormat(),
        winston.format.timestamp(),
        winston.format.json() // JSON format for container environments like Render
    ),
    transports: [
        new winston.transports.Console() // Console only - no file rotation on Render
    ]
});

export default logger;