import ApiError from "../utils/ApiError.js";

const csrfProtectionMiddleware = (req, res, next) => {
    // Skip CSRF check for safe HTTP methods
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const originHeader = req.headers.origin;
    const requestedWithHeader = req.headers["x-requested-with"];

    const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

    // 1. Validate Origin header matches trusted client
    if (!originHeader || originHeader !== allowedOrigin) {
        return next(new ApiError(403, "Forbidden: Invalid or missing Origin header"));
    }

    // 2. Validate custom header to guard against simple cross-site form posts
    if (!requestedWithHeader || requestedWithHeader !== "XMLHttpRequest") {
        return next(new ApiError(403, "Forbidden: Missing or invalid X-Requested-With header"));
    }

    next();
};

export default csrfProtectionMiddleware;