import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";
import translate from "../../utils/translate.js";

import { getDashboardService } from "../../service/dashboard/dashboard.service.js";

export const getDashboard = TryCatch(async (req, res) => {
    const userId = req.user._id;

    const options = {
        page: req.query.page,

        limit: req.query.limit,

        search: req.query.search,

        // `status` is the name used in the Swagger docs, `paymentStatus` the one the frontend sends
        paymentStatus: req.query.paymentStatus ?? req.query.status,

        customerId: req.query.customerId,

        startDate: req.query.startDate,

        endDate: req.query.endDate,

        // Swagger documents `sort=-createdAt`; the frontend sends sortBy + sortOrder
        sortBy: req.query.sortBy ?? String(req.query.sort ?? "").replace(/^-/, "") ?? undefined,

        sortOrder:
            req.query.sortOrder ??
            (String(req.query.sort ?? "").startsWith("-") ? "desc" : undefined),
    };

    const dashboard = await getDashboardService(userId, options, req.language);

    return res
        .status(200)
        .json(new ApiResponse(200, translate("COMMON.DASHBOARD_FETCHED", req.language), dashboard));
});
