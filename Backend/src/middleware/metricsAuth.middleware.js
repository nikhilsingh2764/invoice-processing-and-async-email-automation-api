import ApiError from "../utils/ApiError.js";

export const metricsAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.setHeader("WWW-Authenticate", 'Basic realm="Metrics"');
        return next(new ApiError(401, "Authentication required for metrics"));
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
    const [username, password] = credentials.split(":");

    // Compare with environment variables
    if (username === process.env.METRICS_USER && password === process.env.METRICS_PASSWORD) {
        return next();
    }

    return next(new ApiError(403, "Invalid metrics credentials"));
};
