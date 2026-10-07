import ApiError from "../../utils/ApiError.js";
import productRepository from "../../repository/invoice/product.repository.js";
import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";



export const createProductService = async (
    productData,
    language = "en"
) => {

    const product =
        await productRepository.create(productData);

    if (!product) {

        logger.error(
            `Product creation failed: ${productData.userId}`
        );

        throw new ApiError(
            500,
            translate(
                "PRODUCT.PRODUCT_CREATE_FAILED",
                language
            )
        );
    }


    logger.info(
        `Product created successfully: ${product._id}`
    );

    return product;
};




export const getAllProductsService = async (
    userId,
    language = "en"
) => {

    const products =
        await productRepository.findAll(userId);

    logger.info(
        `Products fetched successfully: ${userId}`
    );

    return products;
};




export const getProductByIdService = async (
    productId,
    userId,
    language = "en"
) => {

    const product =
        await productRepository.findByIdAndUserId(
            productId,
            userId
        );

    if (!product) {

        logger.warn(
            `Product not found: ${productId}`
        );

        throw new ApiError(
            404,
            translate(
                "PRODUCT.PRODUCT_NOT_FOUND",
                language
            )
        );
    }


    return product;
};




export const updateProductService = async (
    productId,
    userId,
    updateData,
    language = "en"
) => {

    const product =
        await productRepository.findByIdAndUserId(
            productId,
            userId
        );

    if (!product) {

        logger.warn(
            `Product update attempted for non-existing product: ${productId}`
        );

        throw new ApiError(
            404,
            translate(
                "PRODUCT.PRODUCT_NOT_FOUND",
                language
            )
        );
    }


    const updatedProduct =
        await productRepository.updateByIdAndUserId(
            productId,
            userId,
            updateData
        );

    if (!updatedProduct) {

        logger.error(
            `Product update failed: ${productId}`
        );

        throw new ApiError(
            500,
            translate(
                "PRODUCT.PRODUCT_UPDATE_FAILED",
                language
            )
        );
    }


    logger.info(
        `Product updated successfully: ${productId}`
    );

    return updatedProduct;
};




export const deleteProductService = async (
    productId,
    userId,
    language = "en"
) => {

    const product =
        await productRepository.findByIdAndUserId(
            productId,
            userId
        );

    if (!product) {

        logger.warn(
            `Product deletion attempted for non-existing product: ${productId}`
        );

        throw new ApiError(
            404,
            translate(
                "PRODUCT.PRODUCT_NOT_FOUND",
                language
            )
        );
    }


    await productRepository.deleteByIdAndUserId(
        productId,
        userId
    );


    logger.info(
        `Product deleted successfully: ${productId}`
    );

    return null;
};