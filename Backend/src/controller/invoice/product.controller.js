import ApiResponse from "../../utils/ApiResponse.js";
import TryCatch from "../../middleware/TryCatch.js";
import translate from "../../utils/translate.js";

import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService
} from "../../service/invoice/product.service.js";



// Create Product
export const createProduct = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const productData = {
        ...req.body,
        userId
    };


    const product = await createProductService(
        productData,
        req.language
    );


    return res.status(201).json(
        new ApiResponse(
            201,
            translate(
                "PRODUCT.PRODUCT_CREATED",
                req.language
            ),
            product
        )
    );

});



// Get All Products
export const getAllProducts = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const products = await getAllProductsService(
        userId,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "PRODUCT.PRODUCTS_FETCHED",
                req.language
            ),
            products
        )
    );

});



// Get Product By ID
export const getProductById = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: productId
    } = req.params;


    const product = await getProductByIdService(
        productId,
        userId,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "PRODUCT.PRODUCT_FETCHED",
                req.language
            ),
            product
        )
    );

});



// Update Product
export const updateProduct = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: productId
    } = req.params;

    const updateData = req.body;


    const updatedProduct =
        await updateProductService(
            productId,
            userId,
            updateData,
            req.language
        );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "PRODUCT.PRODUCT_UPDATED",
                req.language
            ),
            updatedProduct
        )
    );

});



// Delete Product
export const deleteProduct = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: productId
    } = req.params;


    await deleteProductService(
        productId,
        userId,
        req.language
    );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "PRODUCT.PRODUCT_DELETED",
                req.language
            ),
            null
        )
    );

});