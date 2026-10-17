import {
    httpRequestDuration,
    httpRequestsTotal
} from "../config/metrics.js";

const metricsMiddleware = (req, res, next) => {

    const startTime = process.hrtime();

    res.on("finish", () => {

        const [seconds, nanoseconds] =
            process.hrtime(startTime);

        const duration =
            seconds + nanoseconds / 1e9;

        // FIXED: Use req.route?.path if matched, otherwise fallback to "unmatched"
        const route =
            req.route?.path || "unmatched";

        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode.toString()
        };

        httpRequestsTotal.inc(labels);

        httpRequestDuration.observe(
            labels,
            duration
        );
    });

    next();
};

export default metricsMiddleware;