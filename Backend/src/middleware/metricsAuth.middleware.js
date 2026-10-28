import crypto from "crypto";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

// Compare SHA-256 digests (always 32 bytes) so timingSafeEqual never throws on length mismatch
// and the comparison time does not depend on how many characters match.
const safeEqual = (a, b) => {
    const digestA = crypto.createHash("sha256").update(String(a)).digest();
    const digestB = crypto.createHash("sha256").update(String(b)).digest();
    return crypto.timingSafeEqual(digestA, digestB);
};

const metricsAuthMiddleware = (req, res, next) => {
    const expectedUser = process.env.METRICS_USER;
    const expectedPass = process.env.METRICS_PASSWORD;

    // Never fall back to default credentials: if they are not configured, the endpoint is disabled.
    if (!expectedUser || !expectedPass) {
        logger.warn("Metrics endpoint requested but METRICS_USER / METRICS_PASSWORD are not set");
        return next(new ApiError(503, "Metrics endpoint is not configured"));
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.setHeader("WWW-Authenticate", 'Basic realm="Metrics"');
        return next(new ApiError(401, "Authentication required"));
    }

    try {
        // Decode the base64 credentials
        const base64Credentials = authHeader.split(" ")[1] || "";
        const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");

        // Use indexOf instead of split(':') to correctly handle passwords containing colons
        const separatorIndex = credentials.indexOf(":");
        if (separatorIndex === -1) {
            throw new Error("Invalid credentials format");
        }

        const username = credentials.slice(0, separatorIndex);
        const password = credentials.slice(separatorIndex + 1);

        // Evaluate both comparisons (no short-circuit) so timing does not reveal which one failed
        const userMatches = safeEqual(username, expectedUser);
        const passMatches = safeEqual(password, expectedPass);

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
