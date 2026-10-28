import "dotenv/config";

// Validates required environment variables. This module is imported FIRST by server.js and
// worker.js, so a bad configuration stops the process before any other module (Redis,
// MongoDB, queues...) is evaluated.

const REQUIRED_ENV_VARS = [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "BREVO_API_KEY",
    "EMAIL_USER",
    "CLIENT_URL",
    "CACHE_ENCRYPTION_KEY",
];

const missingEnvVars = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key] || process.env[key].trim() === ""
);

if (missingEnvVars.length > 0) {
    console.error(
        `❌ Startup Error: Missing required environment variables in .env: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
}

if (process.env.ACCESS_TOKEN_SECRET === process.env.REFRESH_TOKEN_SECRET) {
    console.error(
        "❌ Startup Error: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different values."
    );
    process.exit(1);
}

// CLIENT_URL may hold one origin or a comma separated list of origins (no trailing slash needed).
export const getAllowedOrigins = () =>
    String(process.env.CLIENT_URL || "")
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean);

// Errors that Redis/BullMQ sockets raise when the network drops. They are retried
// automatically by ioredis, so they must never take the whole process down.
export const TRANSIENT_SOCKET_ERROR_CODES = ["ECONNRESET", "EPIPE", "ETIMEDOUT", "ECONNREFUSED"];
