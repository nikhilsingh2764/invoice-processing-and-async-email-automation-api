import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {

    const startTime = Date.now();

    res.on("finish", () => {

        const duration = Date.now() - startTime;

        logger.info({
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${duration}ms`
        });

    });

    next();
};

export default requestLogger;