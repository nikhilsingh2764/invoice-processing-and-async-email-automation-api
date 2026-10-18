import { Router } from "express";
import {
    livenessCheck,
    readinessCheck,
    healthCheck,
} from "../../controller/health/health.controller.js";

const router = Router();

// GET /api/v1/health/live -> Light liveness probe (Public container check)
router.get("/live", livenessCheck);

// GET /api/v1/health/ready -> Detailed readiness check (Verifies MongoDB & Redis)
router.get("/ready", readinessCheck);

// GET /api/v1/health -> Combined health check endpoint
router.get("/", healthCheck);

export default router;
