import express from "express";
import { getMetrics } from "../../controller/metrics/metrics.controller.js";
import metricsAuthMiddleware from "../../middleware/metricsAuth.middleware.js";

const router = express.Router();

router.get("/metrics", metricsAuthMiddleware, getMetrics);

export default router;
