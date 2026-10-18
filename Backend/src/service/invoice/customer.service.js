import ApiError from "../../utils/ApiError.js";
import customerRepository from "../../repository/invoice/customer.repository.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";

export const createCustomerService = async (userData, language = "en") => {
    const customer = await customerRepository.create(userData);

    if (!customer) {
        logger.error(`Customer creation failed: ${userData.userId}`);

        throw new ApiError(500, translate("CUSTOMER.CUSTOMER_CREATE_FAILED", language));
    }

    logger.info(`Customer created successfully: ${customer._id}`);

    return customer;
};

export const getAllCustomersService = async (userId, queryFilters = {}, language = "en") => {
    const page = Math.max(1, parseInt(queryFilters.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(queryFilters.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // 1. Always bind userId to the query so users only see their own data!
    const query = { userId };

    // 2. Add search filter if provided
    if (queryFilters.search) {
        query.$or = [
            { name: { $regex: queryFilters.search, $options: "i" } },
            { email: { $regex: queryFilters.search, $options: "i" } },
        ];
    }

    // 3. Pass the combined query object containing the userId
    const [customers, total] = await Promise.all([
        customerRepository.findAll(query, skip, limit),
        customerRepository.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        customers,
        pagination: {
            total,
            page,
            limit,
            pages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
};

export const getCustomerByIdService = async (customerId, userId, language = "en") => {
    const customer = await customerRepository.findByIdAndUserId(customerId, userId);

    if (!customer) {
        logger.warn(`Customer not found: ${customerId}`);

        throw new ApiError(404, translate("CUSTOMER.CUSTOMER_NOT_FOUND", language));
    }

    return customer;
};

export const updateCustomerService = async (customerId, userId, updateData, language = "en") => {
    const customer = await customerRepository.findByIdAndUserId(customerId, userId);

    if (!customer) {
        logger.warn(`Customer update attempted for non-existing customer: ${customerId}`);

        throw new ApiError(404, translate("CUSTOMER.CUSTOMER_NOT_FOUND", language));
    }

    const updatedCustomer = await customerRepository.updateByIdAndUserId(
        customerId,
        userId,
        updateData
    );

    if (!updatedCustomer) {
        logger.error(`Customer update failed: ${customerId}`);

        throw new ApiError(500, translate("CUSTOMER.CUSTOMER_UPDATE_FAILED", language));
    }

    logger.info(`Customer updated successfully: ${customerId}`);

    return updatedCustomer;
};

export const deleteCustomerService = async (customerId, userId, language = "en") => {
    const existedCustomer = await customerRepository.findByIdAndUserId(customerId, userId);

    if (!existedCustomer) {
        logger.warn(`Customer deletion attempted for non-existing customer: ${customerId}`);

        throw new ApiError(404, translate("CUSTOMER.CUSTOMER_NOT_FOUND", language));
    }

    await customerRepository.deleteByIdAndUserId(customerId, userId);

    logger.info(`Customer deleted successfully: ${customerId}`);

    return null;
};
