import "./config/sentry.js";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

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

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

app.use(middleware.handle(i18next));

app.use(cookieParser());

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

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is healthy",
    });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler (ALWAYS LAST)
app.use(errorMiddleware);

export default app;
