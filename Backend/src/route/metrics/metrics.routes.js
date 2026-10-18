import express from "express";
import { getMetrics } from "../../controller/metrics/metrics.controller.js";
import { metricsAuth } from "../../middleware/metricsAuth.middleware.js";

const router = express.Router();

router.get("/metrics", metricsAuth, getMetrics);

export default router;
