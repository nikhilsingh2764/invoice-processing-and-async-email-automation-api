import logger from "../utils/logger.js";
import * as Sentry from "@sentry/node";

const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";
    let errors = err.errors || null;

    // 1. Mongoose Validation Error (e.g., schema validation failed)
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation Error";
        errors = {};
        for (const field in err.errors) {
            errors[field] = err.errors[field].message;
        }
    }

    // 2. MongoDB Duplicate Key Error (Code 11000, e.g., unique email constraint)
    if (err.code === 11000) {
        statusCode = 409;
        message = "Conflict Error: Duplicate field value entered";
        errors = {};
        const duplicateField = Object.keys(err.keyValue || {})[0];
        if (duplicateField) {
            errors[duplicateField] = `${duplicateField} already exists.`;
        }
    }

    // 3. Mongoose CastError (e.g., malformed ObjectId in route params like /invoice/abc)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        errors = { [err.path]: `Malformed ID or invalid type provided.` };
    }

    // Never leak internal error details (DB errors, stack hints...) for unexpected 5xx errors
    // in production. Intentional ApiErrors keep their own message.
    if (statusCode >= 500 && !err.statusCode && process.env.NODE_ENV === "production") {
        message = "Internal server error";
        errors = null;
    }

    // Send server errors (5xx) to Sentry, skip client errors (4xx) to avoid noise
    if (statusCode >= 500) {
        Sentry.captureException(err);
    }

    // Log the error
    if (statusCode >= 500) {
        logger.error({
            message: err.message,
            method: req.method,
            url: req.originalUrl,
            statusCode,
            stack: err.stack,
        });
    } else {
        logger.warn(`Client Error [${statusCode}]: ${message} on ${req.method} ${req.originalUrl}`);
    }

    // Build the final response object
    const response = {
        success: false,
        message,
        ...(errors && { errors }),
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
};

export default errorMiddleware;
