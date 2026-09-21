import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";
import translate from "../../utils/translate.js";

import {
    getDashboardService
} from "../../service/dashboard/dashboard.service.js";

export const getDashboard = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const options = {

        page: req.query.page,

        limit: req.query.limit,

        search: req.query.search,

        paymentStatus: req.query.paymentStatus,

        customerId: req.query.customerId,

        startDate: req.query.startDate,

        endDate: req.query.endDate,

        sortBy: req.query.sortBy,

        sortOrder: req.query.sortOrder

    };


    const dashboard = await getDashboardService(
        userId,
        options,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "COMMON.DASHBOARD_FETCHED",
                req.language
            ),
            dashboard
        )
    );

});