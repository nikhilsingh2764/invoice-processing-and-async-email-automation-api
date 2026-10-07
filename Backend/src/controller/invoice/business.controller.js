import TryCatch from "../../middleware/TryCatch.js";
import ApiResponse from "../../utils/ApiResponse.js";
import translate from "../../utils/translate.js";

import {
    createBusinessService,
    getBusinessProfileService,
    updateBusinessProfileService,
    deleteBusinessProfileService
} from "../../service/invoice/business.service.js";



export const createBusiness = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const business = await createBusinessService({
        userId,
        businessData: req.body,
        language: req.language
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "BUSINESS.BUSINESS_CREATED",
                req.language
            ),
            business
        )
    );

});



export const getBusinessProfile = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const business =
        await getBusinessProfileService(
            userId,
            req.language
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "PROFILE.PROFILE_FETCHED",
                req.language
            ),
            business
        )
    );

});



export const updateBusiness = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const newBusinessData = req.body;

    const updatedBusiness =
        await updateBusinessProfileService({
            newBusinessData,
            userId,
            language: req.language
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "BUSINESS.BUSINESS_UPDATED",
                req.language
            ),
            updatedBusiness
        )
    );

});



export const deleteBusiness = TryCatch(async (req, res) => {

    const userId = req.user._id;

    await deleteBusinessProfileService(
        userId,
        req.language
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "BUSINESS.BUSINESS_DELETED",
                req.language
            ),
            null
        )
    );

});