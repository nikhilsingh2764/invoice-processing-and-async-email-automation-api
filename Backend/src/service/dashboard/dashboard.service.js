import redis from "../../config/redis.js";
import dashboardRepository from "../../repository/dashboard/dashboard.repository.js";
import logger from "../../utils/logger.js";

// Removes every cached dashboard of a user. Call after anything that changes invoices,
// customers or products so the dashboard never shows stale numbers.
export const invalidateDashboardCache = async (userId) => {
    try {
        const keys = [];
        const stream = redis.scanStream({ match: `dashboard:${userId}:*`, count: 100 });

        for await (const batch of stream) {
            keys.push(...batch);
        }

        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (error) {
        // A cache problem must never fail the business operation (entries expire after 60s anyway)
        logger.warn(`Dashboard cache invalidation failed: ${error.message}`);
    }
};

export const getDashboardService = async (userId, options) => {
    // Redis cache key
    const cacheKey = `dashboard:${userId}:${JSON.stringify(options)}`;

    // Check Redis
    const cachedDashboard = await redis.get(cacheKey);

    if (cachedDashboard) {
        logger.info(`Dashboard cache hit: ${userId}`);

        return JSON.parse(cachedDashboard);
    }

    logger.info(`Dashboard cache miss: ${userId}`);

    // Fetch all dashboard data
    const [
        stats,
        invoices,
        revenueChart,
        invoiceStatusChart,
        topCustomers,
        topProducts,
        recentInvoices,
    ] = await Promise.all([
        dashboardRepository.getDashboardStats(userId),

        dashboardRepository.getInvoiceList(userId, options),

        dashboardRepository.getRevenueChart(userId),

        dashboardRepository.getInvoiceStatusChart(userId),

        dashboardRepository.getTopCustomers(userId),

        dashboardRepository.getTopProducts(userId),

        dashboardRepository.getRecentInvoices(userId),
    ]);

    // Final response
    const dashboard = {
        stats,
        invoices,
        revenueChart,
        invoiceStatusChart,
        topCustomers,
        topProducts,
        recentInvoices,
    };

    // Store in Redis
    await redis.set(cacheKey, JSON.stringify(dashboard), "EX", 60);

    logger.info(`Dashboard fetched from database and cached: ${userId}`);

    return dashboard;
};
