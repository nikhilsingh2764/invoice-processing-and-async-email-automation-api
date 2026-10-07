import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import { getDashboard } from "../../controller/dashboard/dashboard.controller.js";

const router = express.Router();

// ============================================================
// Dashboard
//
// GET /api/v1/dashboard
//
// Returns:
// - Dashboard Summary
// - Invoice List
// - Revenue Chart
// - Invoice Status Chart
// - Top Customers
// - Top Products
// - Recent Invoices
// ============================================================


/**
 * @swagger
 * /:
 *   get:
 *     summary: Get dashboard data
 *     description: Returns dashboard summary, invoice list, revenue chart, invoice status chart, top customers, top products, and recent invoices.
 *     tags:
 *       - Dashboard
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search invoices by supported invoice/customer fields.
 *         example: rahul
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - Draft
 *             - Pending
 *             - Paid
 *             - Partially Paid
 *             - Overdue
 *             - Cancelled
 *         description: Filter invoices by status.
 *         example: Paid
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum:
 *             - createdAt
 *             - -createdAt
 *         description: Sort invoices by creation date. Use -createdAt for latest first and createdAt for oldest first.
 *         example: -createdAt
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number.
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of invoices per page.
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *
 *       401:
 *         description: Authentication required or access token is invalid
 *
 *       500:
 *         description: Internal server error
 */


router.get(
    "/",
    authMiddleware,
    getDashboard
);


export default router;
