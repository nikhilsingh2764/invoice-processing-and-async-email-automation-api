import crypto from "crypto";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const metricsAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.setHeader("WWW-Authenticate", 'Basic realm="Metrics"');
        return next(new ApiError(401, "Authentication required"));
    }

    try {
        // Decode the base64 credentials
        const base64Credentials = authHeader.split(" ")[1];
        const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");

        // FIX 1: Use indexOf instead of split(':') to correctly handle passwords containing colons
        const separatorIndex = credentials.indexOf(":");
        if (separatorIndex === -1) {
            throw new Error("Invalid credentials format");
        }

        const username = credentials.slice(0, separatorIndex);
        const password = credentials.slice(separatorIndex + 1);

        const expectedUser = process.env.METRICS_USER || "admin";
        const expectedPass = process.env.METRICS_PASSWORD || "password";

        // FIX 2: Use buffers of equal length with crypto.timingSafeEqual to prevent timing attacks
        const userMatches = crypto.timingSafeEqual(
            Buffer.from(username),
            Buffer.from(expectedUser)
        );

        const passMatches = crypto.timingSafeEqual(
            Buffer.from(password),
            Buffer.from(expectedPass)
        );

        if (!userMatches || !passMatches) {
            logger.warn("Metrics Basic Auth failed: Invalid credentials");
            res.setHeader("WWW-Authenticate", 'Basic realm="Metrics"');
            return next(new ApiError(401, "Invalid credentials"));
        }

        next();
    } catch (error) {
        logger.warn(`Metrics Basic Auth error: ${error.message}`);
        res.setHeader("WWW-Authenticate", 'Basic realm="Metrics"');
        return next(new ApiError(401, "Invalid authentication request"));
    }
};

export default metricsAuthMiddleware;
