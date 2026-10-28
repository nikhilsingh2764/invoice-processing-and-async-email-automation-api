import ApiError from "../../utils/ApiError.js";
import productRepository from "../../repository/invoice/product.repository.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";
import { escapeRegExp } from "../../utils/escapeRegExp.js";
import { invalidateDashboardCache } from "../dashboard/dashboard.service.js";

const CREATE_FIELDS = [
    "productName",
    "description",
    "category",
    "unit",
    "price",
    "taxRate",
    "discount",
];

export const createProductService = async (productData, language = "en") => {
    // Whitelist fields: the client must not be able to set _id, createdAt, userId...
    const data = { userId: productData.userId };
    for (const key of CREATE_FIELDS) {
        if (productData[key] !== undefined) data[key] = productData[key];
    }

    const product = await productRepository.create(data);

    if (!product) {
        logger.error(`Product creation failed: ${productData.userId}`);

        throw new ApiError(500, translate("PRODUCT.PRODUCT_CREATE_FAILED", language));
    }

    await invalidateDashboardCache(productData.userId);

    logger.info(`Product created successfully: ${product._id}`);

    return product;
};

export const getAllProductsService = async (userId, queryFilters = {}, language = "en") => {
    // 1. Parse and sanitize pagination inputs
    const page = Math.max(1, parseInt(queryFilters.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(queryFilters.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // 2. Build query object scoped to userId
    const query = { userId };

    // 3. Add search filter (supports product name or description)
    // The search text is escaped: it is user input and must not act as a regex / operator.
    let search = queryFilters.search;
    if (Array.isArray(search)) {
        search = search[search.length - 1];
    }

    if (search && typeof search === "string" && search.trim()) {
        const sanitizedSearch = escapeRegExp(search.trim());
        query.$or = [
            { productName: { $regex: sanitizedSearch, $options: "i" } },
            { description: { $regex: sanitizedSearch, $options: "i" } },
        ];
    }

    // 4. Execute queries concurrently
    const [products, total] = await Promise.all([
        productRepository.findAll(query, skip, limit),
        productRepository.countDocuments(query),
    ]);

    logger.info(`Products fetched successfully: ${userId} (Page: ${page})`);

    const totalPages = Math.ceil(total / limit);

    return {
        products,
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

export const getProductByIdService = async (productId, userId, language = "en") => {
    const product = await productRepository.findByIdAndUserId(productId, userId);

    if (!product) {
        logger.warn(`Product not found: ${productId}`);

        throw new ApiError(404, translate("PRODUCT.PRODUCT_NOT_FOUND", language));
    }

    return product;
};

export const updateProductService = async (productId, userId, rawUpdateData, language = "en") => {
    const allowedUpdates = [
        "productName",
        "description",
        "price",
        "category",
        "unit",
        "taxRate",
        "discount",
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
        if (rawUpdateData[key] !== undefined) {
            updateData[key] = rawUpdateData[key];
        }
    }

    const product = await productRepository.findByIdAndUserId(productId, userId);

    if (!product) {
        logger.warn(`Product update attempted for non-existing product: ${productId}`);
        throw new ApiError(404, translate("PRODUCT.PRODUCT_NOT_FOUND", language));
    }

    const updatedProduct = await productRepository.updateByIdAndUserId(
        productId,
        userId,
        updateData
    );

    if (!updatedProduct) {
        logger.error(`Product update failed: ${productId}`);
        throw new ApiError(500, translate("PRODUCT.PRODUCT_UPDATE_FAILED", language));
    }

    logger.info(`Product updated successfully: ${productId}`);
    return updatedProduct;
};

export const deleteProductService = async (productId, userId, language = "en") => {
    const product = await productRepository.findByIdAndUserId(productId, userId);

    if (!product) {
        logger.warn(`Product deletion attempted for non-existing product: ${productId}`);

        throw new ApiError(404, translate("PRODUCT.PRODUCT_NOT_FOUND", language));
    }

    await productRepository.deleteByIdAndUserId(productId, userId);

    await invalidateDashboardCache(userId);

    logger.info(`Product deleted successfully: ${productId}`);

    return null;
};
