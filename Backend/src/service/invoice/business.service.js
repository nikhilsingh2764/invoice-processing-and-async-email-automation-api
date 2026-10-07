import ApiError from "../../utils/ApiError.js";
import businessRepository from "../../repository/invoice/business.repository.js";

import redis from "../../config/redis.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";



export const createBusinessService = async ({
    businessData,
    userId,
    language = "en"
}) => {

    const cacheKey = `business:${userId}`;

    let business = await redis.get(cacheKey);

    if (business) {

        logger.info(
            `Business profile cache already exists: ${userId}`
        );

        return JSON.parse(business);
    }


    // Check business exists or not
    const existedBusiness =
        await businessRepository.existsByUserId(userId);

    if (existedBusiness) {

        logger.warn(
            `Business profile creation attempted for existing profile: ${userId}`
        );

        throw new ApiError(
            409,
            translate(
                "BUSINESS.BUSINESS_ALREADY_EXISTS",
                language
            )
        );
    }


    businessData.userId = userId;


    // Store businessData in DB
    const BusinessProfile =
        await businessRepository.create(businessData);


    if (!BusinessProfile) {

        logger.error(
            `Business profile creation failed: ${userId}`
        );

        throw new ApiError(
            500,
            translate(
                "BUSINESS.BUSINESS_CREATE_FAILED",
                language
            )
        );
    }


    await redis.set(
        cacheKey,
        JSON.stringify(BusinessProfile),
        "EX",
        600
    );


    logger.info(
        `Business profile created successfully: ${userId}`
    );

    return BusinessProfile;
};




export const getBusinessProfileService = async (
    userId,
    language = "en"
) => {

    const cacheKey = `business:${userId}`;


    // Check Redis
    const cachedBusiness =
        await redis.get(cacheKey);

    if (cachedBusiness) {

        logger.info(
            `Business profile cache hit: ${userId}`
        );

        return JSON.parse(cachedBusiness);
    }


    const existedBusiness =
        await businessRepository.existsByUserId(userId);

    if (!existedBusiness) {

        logger.warn(
            `Business profile not found: ${userId}`
        );

        throw new ApiError(
            404,
            translate(
                "BUSINESS.BUSINESS_NOT_FOUND",
                language
            )
        );
    }


    const businessProfile =
        await businessRepository.findByUserId(userId);


    if (!businessProfile) {

        logger.warn(
            `Business profile not found: ${userId}`
        );

        throw new ApiError(
            404,
            translate(
                "BUSINESS.BUSINESS_NOT_FOUND",
                language
            )
        );
    }


    // Set Redis
    await redis.set(
        cacheKey,
        JSON.stringify(businessProfile),
        "EX",
        600
    );


    logger.info(
        `Business profile fetched from DB and cached: ${userId}`
    );

    return businessProfile;
};




export const updateBusinessProfileService = async ({
    newBusinessData,
    userId,
    language = "en"
}) => {

    // Check exist or not
    const accountExist =
        await businessRepository.existsByUserId(userId);

    if (!accountExist) {

        logger.warn(
            `Business profile update attempted for non-existing profile: ${userId}`
        );

        throw new ApiError(
            404,
            translate(
                "BUSINESS.BUSINESS_NOT_FOUND",
                language
            )
        );
    }


    const updatedData =
        await businessRepository.updateByUserId(
            userId,
            newBusinessData
        );


    if (!updatedData) {

        logger.error(
            `Business profile update failed: ${userId}`
        );

        throw new ApiError(
            500,
            translate(
                "BUSINESS.BUSINESS_UPDATE_FAILED",
                language
            )
        );
    }


    // Remove old Redis cache
    await redis.del(`business:${userId}`);


    // Store updated business profile
    await redis.set(
        `business:${userId}`,
        JSON.stringify(updatedData),
        "EX",
        600
    );


    logger.info(
        `Business profile updated successfully: ${userId}`
    );

    return updatedData;
};




export const deleteBusinessProfileService = async (
    userId,
    language = "en"
) => {

    const accountExist =
        await businessRepository.existsByUserId(userId);

    if (!accountExist) {

        logger.warn(
            `Business profile deletion attempted for non-existing profile: ${userId}`
        );

        throw new ApiError(
            404,
            translate(
                "BUSINESS.BUSINESS_NOT_FOUND",
                language
            )
        );
    }


    await businessRepository.deleteByUserId(userId);

    await redis.del(`business:${userId}`);


    logger.info(
        `Business profile deleted successfully: ${userId}`
    );

    return null;
};