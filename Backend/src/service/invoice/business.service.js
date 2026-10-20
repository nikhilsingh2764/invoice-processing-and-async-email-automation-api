import ApiError from "../../utils/ApiError.js";
import businessRepository from "../../repository/invoice/business.repository.js";

import redis from "../../config/redis.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";

export const createBusinessService = async ({ businessData, userId, language = "en" }) => {
    const cacheKey = `business:${userId}`;

    // Check business exists in DB or cache
    const existedBusiness = await businessRepository.existsByUserId(userId);

    if (existedBusiness) {
        logger.warn(`Business profile creation attempted for existing profile: ${userId}`);

        throw new ApiError(409, translate("BUSINESS.BUSINESS_ALREADY_EXISTS", language));
    }

    businessData.userId = userId;

    // Store businessData in DB
    const BusinessProfile = await businessRepository.create(businessData);

    if (!BusinessProfile) {
        logger.error(`Business profile creation failed: ${userId}`);

        throw new ApiError(500, translate("BUSINESS.BUSINESS_CREATE_FAILED", language));
    }

    // Cache with a lower TTL (60 seconds) to prevent stale invoice counters
    await redis.set(cacheKey, JSON.stringify(BusinessProfile), "EX", 60);

    logger.info(`Business profile created successfully: ${userId}`);

    return BusinessProfile;
};

export const getBusinessProfileService = async (userId, language = "en") => {
    const cacheKey = `business:${userId}`;

    // Check Redis
    const cachedBusiness = await redis.get(cacheKey);

    if (cachedBusiness) {
        logger.info(`Business profile cache hit: ${userId}`);

        return JSON.parse(cachedBusiness);
    }

    const businessProfile = await businessRepository.findByUserId(userId);

    if (!businessProfile) {
        logger.warn(`Business profile not found: ${userId}`);

        throw new ApiError(404, translate("BUSINESS.BUSINESS_NOT_FOUND", language));
    }

    // Set Redis with 60s TTL
    await redis.set(cacheKey, JSON.stringify(businessProfile), "EX", 60);

    logger.info(`Business profile fetched from DB and cached: ${userId}`);

    return businessProfile;
};

export const updateBusinessProfileService = async (
    businessId,
    userId,
    rawUpdateData,
    language = "en"
) => {
    const allowedUpdates = [
        "businessName",
        "email",
        "phone",
        "address",
        "gstNumber",
        "panNumber",
        "bankDetails",
        "logo",
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
        if (rawUpdateData[key] !== undefined) {
            updateData[key] = rawUpdateData[key];
        }
    }

    const business = await businessRepository.findByIdAndUserId(businessId, userId);

    if (!business) {
        logger.warn(`Business update attempted for non-existing business: ${businessId}`);
        throw new ApiError(404, translate("BUSINESS.BUSINESS_NOT_FOUND", language));
    }

    const updatedBusiness = await businessRepository.updateByIdAndUserId(
        businessId,
        userId,
        updateData
    );

    if (!updatedBusiness) {
        logger.error(`Business update failed: ${businessId}`);
        throw new ApiError(500, translate("BUSINESS.BUSINESS_UPDATE_FAILED", language));
    }

    logger.info(`Business updated successfully: ${businessId}`);
    return updatedBusiness;
};

export const deleteBusinessProfileService = async (userId, language = "en") => {
    const accountExist = await businessRepository.existsByUserId(userId);

    if (!accountExist) {
        logger.warn(`Business profile deletion attempted for non-existing profile: ${userId}`);

        throw new ApiError(404, translate("BUSINESS.BUSINESS_NOT_FOUND", language));
    }

    await businessRepository.deleteByUserId(userId);

    await redis.del(`business:${userId}`);

    logger.info(`Business profile deleted successfully: ${userId}`);

    return null;
};
