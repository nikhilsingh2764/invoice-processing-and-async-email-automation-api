import redis from "../../config/redis.js";
import dashboardRepository from "../../repository/dashboard/dashboard.repository.js";
import logger from "../../utils/logger.js";
import withTimeout from "../../utils/withTimeout.js";

// Removes every cached dashboard of a user. Call after anything that changes invoices,
// customers or products so the dashboard never shows stale numbers.
export const invalidateDashboardCache = async (userId) => {
    try {
        await withTimeout(
            (async () => {
                const keys = [];
                const stream = redis.scanStream({ match: `dashboard:${userId}:*`, count: 100 });

                for await (const batch of stream) {
                    keys.push(...batch);
                }

                if (keys.length > 0) {
                    await redis.del(...keys);
                }
            })(),
            3000,
            "Dashboard cache invalidation"
        );
    } catch (error) {
        // A cache problem must never fail the business operation (entries expire after 60s anyway)
        logger.warn(`Dashboard cache invalidation failed: ${error.message}`);
    }
};

export const getDashboardService = async (userId, options) => {
    // Redis cache key
    const cacheKey = `dashboard:${userId}:${JSON.stringify(options)}`;

    // Check Redis
    // The cache is an optimisation only: if Redis is slow or down, read from MongoDB instead of hanging/failing.
    let cachedDashboard = null;
    try {
        cachedDashboard = await withTimeout(redis.get(cacheKey), 1500, "Dashboard cache read");
    } catch (error) {
        logger.warn(`Dashboard cache read skipped: ${error.message}`);
    }

    if (cachedDashboard) {
        try {
            logger.info(`Dashboard cache hit: ${userId}`);

            return JSON.parse(cachedDashboard);
        } catch {
            logger.warn(`Dashboard cache entry unreadable, rebuilding: ${userId}`);
        }
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
    try {
        await withTimeout(redis.set(cacheKey, JSON.stringify(dashboard), "EX", 60), 1500, "Dashboard cache write");
    } catch (error) {
        logger.warn(`Dashboard cache write skipped: ${error.message}`);
    }

    logger.info(`Dashboard fetched from database and cached: ${userId}`);

    return dashboard;
};
