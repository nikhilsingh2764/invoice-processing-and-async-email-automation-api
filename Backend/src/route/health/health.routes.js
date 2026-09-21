import express from "express";

import {
    healthCheck,
    livenessCheck,
    readinessCheck
} from "../../controller/health/health.controller.js";


const router = express.Router();

router.get("/health", healthCheck);

router.get("/health/live", livenessCheck);

router.get("/health/ready", readinessCheck);

export default router;