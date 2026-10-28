import { query } from "express-validator";

const STATUSES = ["Draft", "Pending", "Paid", "Partially Paid", "Overdue", "Cancelled"];

// Dashboard query string validation. Invalid ids/dates would otherwise crash the aggregation
// (BSON errors -> HTTP 500).
export const dashboardValidator = [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("limit must be between 1 and 100"),
    query("paymentStatus").optional().isIn(STATUSES).withMessage("Invalid payment status"),
    query("status").optional().isIn(STATUSES).withMessage("Invalid status"),
    query("customerId").optional().isMongoId().withMessage("Invalid customer id"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
    query("search").optional().isString().isLength({ max: 100 }).withMessage("Search is too long"),
];
