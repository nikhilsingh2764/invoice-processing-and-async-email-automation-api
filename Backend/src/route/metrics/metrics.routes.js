import express from "express";
import { getMetrics } from "../../controller/metrics/metrics.controller.js";


const router = express.Router();

router.get("/metrics", getMetrics);

export default router;