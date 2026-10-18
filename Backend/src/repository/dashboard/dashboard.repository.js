import mongoose from "mongoose";
import Invoice from "../../model/invoice/invoice.model.js";
import Customer from "../../model/invoice/customer.model.js";
import Product from "../../model/invoice/product.model.js";
import { PAYMENT_STATUS } from "../../utils/invoice.constant.js";

// Helper to escape special regex characters and prevent ReDoS / injection
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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
                        // 4. Overdue Invoices Count (Pending + DueDate passed)
                        overdueInvoices: [
                            { $match: { status: PAYMENT_STATUS.PENDING, dueDate: { $lt: now } } },
                            { $count: "count" },
                        ],
                        // 5. Financial Totals (Revenue collected via amountPaid & Outstanding balance)
                        financials: [
                            {
                                $group: {
                                    _id: null,
                                    totalRevenue: { $sum: "$amountPaid" },
                                    totalDueAmount: {
                                        $sum: {
                                            $subtract: ["$grandTotal", "$amountPaid"],
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
        if (paymentStatus) {
            filter.status = paymentStatus;
        }

        // Customer Filter
        if (customerId) {
            filter.customerId = new mongoose.Types.ObjectId(customerId);
        }

        // Date Filter
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filter.createdAt.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
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
}

export default new DashboardRepository();
