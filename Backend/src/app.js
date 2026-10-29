import "./config/sentry.js";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError.js";
import { getAllowedOrigins } from "./config/env.js";

import i18next from "./config/i18n.js";
import middleware from "i18next-http-middleware";

import userRoutes from "./route/auth/user.routes.js";
import tokenRoutes from "./route/auth/token.routes.js";
import businessRoutes from "./route/invoice/business.routes.js";
import productRoutes from "./route/invoice/product.routes.js";
import customerRoutes from "./route/invoice/customer.routes.js";
import invoiceRoutes from "./route/invoice/invoice.routes.js";
import dashboardRoutes from "./route/dashboard/dashboard.routes.js";

import healthRouter from "./route/health/health.routes.js";
import metricsRouter from "./route/metrics/metrics.routes.js";

import metricsMiddleware from "./middleware/metrics.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import csrfProtectionMiddleware from "./middleware/csrfProtectionMiddleware.js";

import requestLogger from "./middleware/requestLogger.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.set("trust proxy", 1);

// Security
app.use(helmet());

// CLIENT_URL can hold one origin or a comma separated list. Origins are compared without a
// trailing slash, exactly as browsers send them in the Origin header.
const allowedOrigins = getAllowedOrigins();

app.use(
    cors({
        origin: (origin, callback) => {
            // Requests without an Origin header (curl, server-to-server, health probes) are not
            // browser cross-site requests, so CORS does not apply. State-changing requests are
            // still protected by the CSRF middleware below.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "X-Requested-With", "Accept", "Accept-Language"],
    })
);

app.use(express.json({ limit: "1mb" }));

app.use(middleware.handle(i18next));

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(csrfProtectionMiddleware);

app.use(requestLogger);

app.use(metricsMiddleware);

//routes handle here

app.use("/api/v1", userRoutes);

app.use("/api/v1", tokenRoutes);

app.use("/api/v1", businessRoutes);

app.use("/api/v1", productRoutes);

app.use("/api/v1", customerRoutes);

app.use("/api/v1", invoiceRoutes);

app.use("/api/v1/dashboard", dashboardRoutes);

app.use("/api/v1", healthRouter);

app.use("/api/v1", metricsRouter);



// Unknown routes -> JSON 404 (instead of Express' default HTML page)
app.use((req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Global Error Handler (ALWAYS LAST)
app.use(errorMiddleware);

export default app;
