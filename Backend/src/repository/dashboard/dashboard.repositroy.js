import mongoose from "mongoose";

import Invoice from "../../model/invoice/invoice.model.js";
import Customer from "../../model/invoice/customer.model.js";
import Product from "../../model/invoice/product.model.js";

import { PAYMENT_STATUS } from "../../utils/invoice.constant.js";


class DashboardRepository {


    // Dashboard Statistics
    async getDashboardStats(userId) {

        const objectUserId = new mongoose.Types.ObjectId(userId);

        const now = new Date();

        const [
            totalCustomers,
            totalProducts,
            totalInvoices,
            paidInvoices,
            pendingInvoices,
            overdueInvoices,
            amount
        ] = await Promise.all([

            Customer.countDocuments({
                userId
            }),

            Product.countDocuments({
                userId
            }),

            Invoice.countDocuments({
                userId
            }),

            Invoice.countDocuments({
                userId,
                status: PAYMENT_STATUS.PAID
            }),

            Invoice.countDocuments({
                userId,
                status: PAYMENT_STATUS.PENDING
            }),

            Invoice.countDocuments({
                userId,
                status: PAYMENT_STATUS.PENDING,
                dueDate: {
                    $lt: now
                }
            }),

            Invoice.aggregate([
                {
                    $match: {
                        userId: objectUserId
                    }
                },

                {
                    $group: {
                        _id: null,

                        totalRevenue: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$status",
                                            PAYMENT_STATUS.PAID
                                        ]
                                    },
                                    "$grandTotal",
                                    0
                                ]
                            }
                        },

                        totalDueAmount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$status",
                                            PAYMENT_STATUS.PENDING
                                        ]
                                    },
                                    "$grandTotal",
                                    0
                                ]
                            }
                        }
                    }
                }
            ])

        ]);


        return {

            totalCustomers,

            totalProducts,

            totalInvoices,

            paidInvoices,

            pendingInvoices,

            overdueInvoices,

            totalRevenue:
                amount[0]?.totalRevenue || 0,

            totalDueAmount:
                amount[0]?.totalDueAmount || 0

        };
    }


    // Invoice List
    async getInvoiceList(userId, options = {}) {

        const {
            page = 1,
            limit = 10,
            search = "",
            paymentStatus,
            customerId,
            startDate,
            endDate,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = options;


        const safePage = Math.max(Number(page) || 1, 1);

        const safeLimit = Math.min(
            Math.max(Number(limit) || 10, 1),
            100
        );


        const allowedSortFields = [
            "createdAt",
            "invoiceDate",
            "dueDate",
            "grandTotal",
            "invoiceNumber",
            "status"
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";

        const safeSortOrder =
            sortOrder === "asc" ? 1 : -1;


        const filter = {
            userId: new mongoose.Types.ObjectId(userId)
        };


        // Search
        if (search.trim()) {

            filter.$or = [

                {
                    invoiceNumber: {
                        $regex: search.trim(),
                        $options: "i"
                    }
                },

                {
                    "customer.customerName": {
                        $regex: search.trim(),
                        $options: "i"
                    }
                }

            ];
        }


        // Payment Status
        if (paymentStatus) {
            filter.status = paymentStatus;
        }


        // Customer Filter
        if (customerId) {

            filter.customerId =
                new mongoose.Types.ObjectId(customerId);

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


        // Fetch invoices
        const invoices = await Invoice
            .find(filter)
            .sort({
                [safeSortBy]: safeSortOrder
            })
            .skip(
                (safePage - 1) * safeLimit
            )
            .limit(safeLimit)
            .lean();


        // Total count
        const totalInvoices =
            await Invoice.countDocuments(filter);


        // Format invoices
        const formattedInvoices = invoices.map(
            invoice => ({

                ...invoice,

                totalAmount:
                    invoice.grandTotal,

                paymentStatus:
                    invoice.status

            })
        );


        return {

            invoices: formattedInvoices,

            pagination: {

                totalInvoices,

                currentPage: safePage,

                totalPages:
                    Math.ceil(
                        totalInvoices / safeLimit
                    ),

                limit: safeLimit

            }

        };

    }


    // Revenue Chart
    async getRevenueChart(userId) {

        return await Invoice.aggregate([

            {
                $match: {
                    userId:
                        new mongoose.Types.ObjectId(userId),

                    status:
                        PAYMENT_STATUS.PAID
                }
            },

            {
                $group: {

                    _id: {

                        year: {
                            $year: "$createdAt"
                        },

                        month: {
                            $month: "$createdAt"
                        }

                    },

                    totalRevenue: {
                        $sum: "$grandTotal"
                    },

                    totalInvoices: {
                        $sum: 1
                    }

                }
            },

            {
                $sort: {

                    "_id.year": 1,

                    "_id.month": 1

                }
            }

        ]);

    }


    // Invoice Status Chart
    async getInvoiceStatusChart(userId) {

        return await Invoice.aggregate([

            {
                $match: {
                    userId:
                        new mongoose.Types.ObjectId(userId)
                }
            },

            {
                $group: {

                    _id: "$status",

                    totalInvoices: {
                        $sum: 1
                    }

                }
            }

        ]);

    }


    // Top Customers
    async getTopCustomers(userId) {

        return await Invoice.aggregate([

            {
                $match: {

                    userId:
                        new mongoose.Types.ObjectId(userId),

                    status:
                        PAYMENT_STATUS.PAID

                }
            },

            {
                $group: {

                    _id: "$customerId",

                    customerName: {
                        $first:
                            "$customer.customerName"
                    },

                    customerEmail: {
                        $first:
                            "$customer.email"
                    },

                    totalInvoices: {
                        $sum: 1
                    },

                    totalRevenue: {
                        $sum: "$grandTotal"
                    }

                }
            },

            {
                $sort: {
                    totalRevenue: -1
                }
            },

            {
                $limit: 5
            }

        ]);

    }


    // Top Products
    async getTopProducts(userId) {

        return await Invoice.aggregate([

            {
                $match: {

                    userId:
                        new mongoose.Types.ObjectId(userId),

                    status:
                        PAYMENT_STATUS.PAID

                }
            },

            {
                $unwind: "$items"
            },

            {
                $group: {

                    _id: "$items.productId",

                    productName: {
                        $first:
                            "$items.productName"
                    },

                    totalQuantitySold: {
                        $sum:
                            "$items.quantity"
                    },

                    totalRevenue: {
                        $sum:
                            "$items.total"
                    }

                }
            },

            {
                $sort: {
                    totalRevenue: -1
                }
            },

            {
                $limit: 5
            }

        ]);

    }


    // Recent Invoices
    async getRecentInvoices(userId) {

        const invoices = await Invoice
            .find({
                userId
            })
            .sort({
                createdAt: -1
            })
            .limit(5)
            .select(
                "invoiceNumber customer grandTotal status dueDate createdAt"
            )
            .lean();


        return invoices.map(
            invoice => ({

                ...invoice,

                totalAmount:
                    invoice.grandTotal,

                paymentStatus:
                    invoice.status

            })
        );

    }

}


export default new DashboardRepository();