import authMiddleware from '../../middleware/auth.middleware.js';

import express from "express";

import {
    createProductValidator,
    updateProductValidator
} from '../../validators/product.validator.js';

import validate from '../../middleware/validate.js';

import {
    ProductLimiter
} from '../../middleware/rateLimiter.middleware.js';

import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../../controller/invoice/product.controller.js";


const router = express.Router();


/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: Product management
 */


/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create product
 *     description: Creates a new product for the authenticated user.
 *     tags:
 *       - Product
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - description
 *               - category
 *               - unit
 *               - price
 *             properties:
 *
 *               productName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Laptop
 *
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: HP 15S Laptop
 *
 *               category:
 *                 type: string
 *                 example: Electronics
 *
 *               unit:
 *                 type: string
 *                 enum:
 *                   - piece
 *                   - kg
 *                   - gram
 *                   - liter
 *                   - meter
 *                   - hour
 *                   - service
 *                 example: piece
 *
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 example: 5000
 *
 *               taxRate:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 12
 *
 *               discount:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 5
 *
 *     responses:
 *       201:
 *         description: Product created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required
 *
 *       409:
 *         description: Product already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post(
    '/product',
    ProductLimiter,
    authMiddleware,
    createProductValidator,
    validate,
    createProduct
);


/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get all products
 *     description: Returns all products belonging to the authenticated user.
 *     tags:
 *       - Product
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: No products found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    '/product',
    authMiddleware,
    getAllProducts
);


/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Returns a specific product belonging to the authenticated user.
 *     tags:
 *       - Product
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: 6a69076264a41a108c46d72c
 *
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *
 *       400:
 *         description: Invalid product ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Product not found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    '/product/:id',
    authMiddleware,
    getProductById
);


/**
 * @swagger
 * /product/{id}:
 *   patch:
 *     summary: Update product
 *     description: Updates one or more fields of an existing product.
 *     tags:
 *       - Product
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: 6a69076264a41a108c46d72c
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *
 *               productName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Dell Inspiron 15
 *
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Dell Inspiron 15 12th Gen Intel i5 Laptop
 *
 *               category:
 *                 type: string
 *                 example: Electronics
 *
 *               unit:
 *                 type: string
 *                 enum:
 *                   - piece
 *                   - kg
 *                   - gram
 *                   - liter
 *                   - meter
 *                   - hour
 *                   - service
 *                 example: piece
 *
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 example: 58999
 *
 *               taxRate:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 18
 *
 *               discount:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 10
 *
 *     responses:
 *       200:
 *         description: Product updated successfully
 *
 *       400:
 *         description: Validation error or invalid product ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Product not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/product/:id',
    ProductLimiter,
    authMiddleware,
    updateProductValidator,
    validate,
    updateProduct
);


/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete product
 *     description: Deletes a specific product belonging to the authenticated user.
 *     tags:
 *       - Product
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *           example: 6a69076264a41a108c46d72c
 *
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *
 *       400:
 *         description: Invalid product ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Product not found
 *
 *       500:
 *         description: Internal server error
 */
router.delete(
    '/product/:id',
    ProductLimiter,
    authMiddleware,
    deleteProduct
);


export default router;