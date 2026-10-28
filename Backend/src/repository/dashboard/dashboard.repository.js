import mongoose from "mongoose";
import Invoice from "../../model/invoice/invoice.model.js";
import Customer from "../../model/invoice/customer.model.js";
import Product from "../../model/invoice/product.model.js";
import { PAYMENT_STATUS } from "../../utils/invoice.constant.js";

import { escapeRegExp } from "../../utils/escapeRegExp.js";

// Revenue of one invoice: a Paid invoice counts in full, other invoices count what was paid so far
const REVENUE_EXPR = {
    $cond: [{ $eq: ["$status", PAYMENT_STATUS.PAID] }, "$grandTotal", "$amountPaid"],
};

// Statuses that still wait for money
const OPEN_STATUSES = [
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.PARTIALLY_PAID,
    PAYMENT_STATUS.OVERDUE,
];

class DashboardRepository {
    // Dashboard Statistics (Combined into a single $facet aggregation pipeline for invoices)
    async getDashboardStats(userId) {
        const objectUserId = new mongoose.Types.ObjectId(userId);
        const now = new Date();

        // Run collection counts and the multi-metric invoice $facet aggregation in parallel
        const [totalCustomers, totalProducts, invoiceStatsResult] = await Promise.all([
            Customer.countDocuments({ userId }),
            Product.countDocuments({ userId }),
            Invoice.aggregate([
                {
                    $match: {
                        userId: objectUserId,
                    },
                },
                {
                    $facet: {
                        // 1. Total Invoice Count
                        totalInvoices: [{ $count: "count" }],
                        // 2. Paid Invoices Count
                        paidInvoices: [
                            { $match: { status: PAYMENT_STATUS.PAID } },
                            { $count: "count" },
                        ],
                        // 3. Pending Invoices Count
                        pendingInvoices: [
                            { $match: { status: PAYMENT_STATUS.PENDING } },
                            { $count: "count" },
                        ],
                        // 4. Overdue Invoices Count: marked Overdue, or still waiting for payment
                        //    after the due date (the nightly job has not run yet)
                        overdueInvoices: [
                            {
                                $match: {
                                    $or: [
                                        { status: PAYMENT_STATUS.OVERDUE },
                                        {
                                            status: {
                                                $in: [
                                                    PAYMENT_STATUS.PENDING,
                                                    PAYMENT_STATUS.PARTIALLY_PAID,
                                                ],
                                            },
                                            dueDate: { $lt: now },
                                        },
                                    ],
                                },
                            },
                            { $count: "count" },
                        ],
                        // 5. Financial Totals (revenue collected & outstanding balance)
                        financials: [
                            {
                                $group: {
                                    _id: null,
                                    totalRevenue: { $sum: REVENUE_EXPR },
                                    totalDueAmount: {
                                        $sum: {
                                            $cond: [
                                                { $in: ["$status", OPEN_STATUSES] },
                                                { $subtract: ["$grandTotal", "$amountPaid"] },
                                                0,
                                            ],
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ]),
        ]);

        const stats = invoiceStatsResult[0] || {};

        return {
            totalCustomers,
            totalProducts,
            totalInvoices: stats.totalInvoices?.[0]?.count || 0,
            paidInvoices: stats.paidInvoices?.[0]?.count || 0,
            pendingInvoices: stats.pendingInvoices?.[0]?.count || 0,
            overdueInvoices: stats.overdueInvoices?.[0]?.count || 0,
            totalRevenue: stats.financials?.[0]?.totalRevenue || 0,
            totalDueAmount: stats.financials?.[0]?.totalDueAmount || 0,
        };
    }

    // Invoice List with Pagination, Filtering, and Search
    async getInvoiceList(userId, options = {}) {
        let {
            page = 1,
            limit = 10,
            search = "",
            paymentStatus,
            customerId,
            startDate,
            endDate,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = options;

        const safePage = Math.max(Number(page) || 1, 1);
        const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const allowedSortFields = [
            "createdAt",
            "invoiceDate",
            "dueDate",
            "grandTotal",
            "invoiceNumber",
            "status",
        ];

        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

        const safeSortOrder = sortOrder === "asc" ? 1 : -1;

        const filter = {
            userId: new mongoose.Types.ObjectId(userId),
        };

        // Secure Search Handling (Prevents Array Pollution, ReDoS, and Crashes)
        if (Array.isArray(search)) {
            search = search[search.length - 1];
        }

        if (search && typeof search === "string" && search.trim()) {
            const sanitizedSearch = escapeRegExp(search.trim());

            filter.$or = [
                {
                    invoiceNumber: {
                        $regex: sanitizedSearch,
                        $options: "i",
                    },
                },
                {
                    "customer.customerName": {
                        $regex: sanitizedSearch,
                        $options: "i",
                    },
                },
            ];
        }

        // Payment Status
        if (
            typeof paymentStatus === "string" &&
            Object.values(PAYMENT_STATUS).includes(paymentStatus)
        ) {
            filter.status = paymentStatus;
        }

        // Customer Filter
        if (customerId && mongoose.isValidObjectId(customerId)) {
            filter.customerId = new mongoose.Types.ObjectId(customerId);
        }

        // Date Filter
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate && !Number.isNaN(new Date(startDate).getTime())) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filter.createdAt.$gte = start;
            }

            if (endDate && !Number.isNaN(new Date(endDate).getTime())) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }

            if (Object.keys(filter.createdAt).length === 0) {
                delete filter.createdAt;
            }
        }

        const skip = (safePage - 1) * safeLimit;

        const [invoices, totalCount] = await Promise.all([
            Invoice.find(filter)
                .sort({ [safeSortBy]: safeSortOrder })
                .skip(skip)
                .limit(safeLimit)
                .lean(),
            Invoice.countDocuments(filter),
        ]);

        return {
            invoices,
            pagination: {
                totalDocs: totalCount,
                totalPages: Math.ceil(totalCount / safeLimit),
                currentPage: safePage,
                limit: safeLimit,
            },
        };
    }

    // Revenue Chart Analytics Aggregation (monthly, last 12 months with revenue)
    // Shape consumed by the frontend: { _id: { year, month }, totalRevenue, totalInvoices }
    async getRevenueChart(userId) {
        const objectUserId = new mongoose.Types.ObjectId(userId);

        const revenueData = await Invoice.aggregate([
            {
                $match: {
                    userId: objectUserId,
                    status: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.PARTIALLY_PAID] },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalRevenue: { $sum: REVENUE_EXPR },
                    totalInvoices: { $sum: 1 },
                },
            },
            // newest 12 months, then back to chronological order
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        return revenueData;
    }

    // Invoice Status Breakdown for Charts
    async getInvoiceStatusChart(userId) {
        const objectUserId = new mongoose.Types.ObjectId(userId);

        const statusData = await Invoice.aggregate([
            { $match: { userId: objectUserId } },
            {
                $group: {
                    _id: "$status",
                    totalInvoices: { $sum: 1 },
                    totalAmount: { $sum: "$grandTotal" },
                },
            },
        ]);

        // `count` kept as an alias for existing API consumers
        return statusData.map((row) => ({ ...row, count: row.totalInvoices }));
    }

    // Top Customers Analytics (grouped by the customerId stored on each invoice)
    async getTopCustomers(userId) {
        const objectUserId = new mongoose.Types.ObjectId(userId);

        const topCustomers = await Invoice.aggregate([
            {
                $match: {
                    userId: objectUserId,
                    customerId: { $ne: null },
                    status: { $nin: [PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.DRAFT] },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$customerId",
                    customerName: { $first: "$customer.customerName" },
                    customerEmail: { $first: "$customer.email" },
                    totalInvoices: { $sum: 1 },
                    totalRevenue: { $sum: "$grandTotal" },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
        ]);

        // `totalSpent` kept as an alias for existing API consumers
        return topCustomers.map((row) => ({ ...row, totalSpent: row.totalRevenue }));
    }

    // Top Products Analytics
    async getTopProducts(userId) {
        const objectUserId = new mongoose.Types.ObjectId(userId);

        const topProducts = await Invoice.aggregate([
            {
                $match: {
                    userId: objectUserId,
                    status: { $nin: [PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.DRAFT] },
                },
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    productName: { $first: "$items.productName" },
                    totalQuantitySold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.lineTotal" },
                },
            },
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 5 },
        ]);

        // `totalSold` kept as an alias for existing API consumers
        return topProducts.map((row) => ({ ...row, totalSold: row.totalQuantitySold }));
    }

    // Recent Invoices List
    async getRecentInvoices(userId) {
        const objectUserId = new mongoose.Types.ObjectId(userId);

        const recentInvoices = await Invoice.find({ userId: objectUserId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return recentInvoices;
    }
}

export default new DashboardRepository();
