import authMiddleware from '../../middleware/auth.middleware.js';

import express from "express";

import {
    createCustomerValidator,
    updateCustomerValidator
} from '../../validators/customer.validator.js';

import validate from '../../middleware/validate.js';

import {
    CustomerLimiter
} from '../../middleware/rateLimiter.middleware.js';

import {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
} from '../../controller/invoice/customer.controller.js';


const router = express.Router();


/**
 * @swagger
 * tags:
 *   - name: Customer
 *     description: Customer management
 */


/**
 * @swagger
 * /customer:
 *   post:
 *     summary: Create customer
 *     description: Creates a new customer for the authenticated user.
 *     tags:
 *       - Customer
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
 *               - customerName
 *               - email
 *               - phone
 *               - customerType
 *               - billingAddress
 *             properties:
 *
 *               customerName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: liya naveed
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nikhilsinghdfg@gmail.com
 *
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{10}$"
 *                 example: "8407937952"
 *
 *               companyName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: TechNova Solutions
 *
 *               gstNumber:
 *                 type: string
 *                 minLength: 15
 *                 maxLength: 15
 *                 pattern: "^[0-9A-Za-z]{15}$"
 *                 example: 27ABCDE1234F1Z5
 *
 *               customerType:
 *                 type: string
 *                 enum:
 *                   - Individual
 *                   - Business
 *                 example: Business
 *
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: Preferred customer
 *
 *               billingAddress:
 *                 type: object
 *                 required:
 *                   - addressLine1
 *                   - city
 *                   - state
 *                   - country
 *                   - postalCode
 *                 properties:
 *
 *                   addressLine1:
 *                     type: string
 *                     example: 101 Park Street
 *
 *                   addressLine2:
 *                     type: string
 *                     example: Near City Mall
 *
 *                   city:
 *                     type: string
 *                     example: Pune
 *
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *
 *                   country:
 *                     type: string
 *                     example: India
 *
 *                   postalCode:
 *                     type: string
 *                     pattern: "^[1-9][0-9]{5}$"
 *                     example: "411001"
 *
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *
 *                   addressLine1:
 *                     type: string
 *                     example: Warehouse 5
 *
 *                   addressLine2:
 *                     type: string
 *                     example: MIDC Phase 2
 *
 *                   city:
 *                     type: string
 *                     example: Pune
 *
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *
 *                   country:
 *                     type: string
 *                     example: India
 *
 *                   postalCode:
 *                     type: string
 *                     pattern: "^[1-9][0-9]{5}$"
 *                     example: "411045"
 *
 *     responses:
 *       201:
 *         description: Customer created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required
 *
 *       409:
 *         description: Customer already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post(
    '/customer',
    CustomerLimiter,
    authMiddleware,
    createCustomerValidator,
    validate,
    createCustomer
);


/**
 * @swagger
 * /customer:
 *   get:
 *     summary: Get all customers
 *     description: Returns all customers belonging to the authenticated user.
 *     tags:
 *       - Customer
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: Customers fetched successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: No customers found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    '/customer',
    authMiddleware,
    getAllCustomers
);


/**
 * @swagger
 * /customer/{id}:
 *   get:
 *     summary: Get customer by ID
 *     description: Returns a specific customer belonging to the authenticated user.
 *     tags:
 *       - Customer
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Customer ID
 *         schema:
 *           type: string
 *           example: 6a6907f164a41a108c46d72f
 *
 *     responses:
 *       200:
 *         description: Customer fetched successfully
 *
 *       400:
 *         description: Invalid customer ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Customer not found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    '/customer/:id',
    authMiddleware,
    getCustomerById
);


/**
 * @swagger
 * /customer/{id}:
 *   patch:
 *     summary: Update customer
 *     description: Updates one or more fields of an existing customer.
 *     tags:
 *       - Customer
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Customer ID
 *         schema:
 *           type: string
 *           example: 6a6907f164a41a108c46d72f
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *
 *               customerName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Priya Verma Updated
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: priya@example.com
 *
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{10}$"
 *                 example: "9988776655"
 *
 *               companyName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: TechNova Pvt Ltd
 *
 *               gstNumber:
 *                 type: string
 *                 minLength: 15
 *                 maxLength: 15
 *                 pattern: "^[0-9A-Za-z]{15}$"
 *                 example: 27ABCDE1234F1Z5
 *
 *               customerType:
 *                 type: string
 *                 enum:
 *                   - Individual
 *                   - Business
 *                 example: Business
 *
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: VIP customer
 *
 *               billingAddress:
 *                 type: object
 *                 properties:
 *
 *                   addressLine1:
 *                     type: string
 *                     example: 202 FC Road
 *
 *                   addressLine2:
 *                     type: string
 *                     example: Near Metro Station
 *
 *                   city:
 *                     type: string
 *                     example: Pune
 *
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *
 *                   country:
 *                     type: string
 *                     example: India
 *
 *                   postalCode:
 *                     type: string
 *                     pattern: "^[1-9][0-9]{5}$"
 *                     example: "411004"
 *
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *
 *                   addressLine1:
 *                     type: string
 *                     example: Warehouse 5
 *
 *                   addressLine2:
 *                     type: string
 *                     example: MIDC Phase 2
 *
 *                   city:
 *                     type: string
 *                     example: Pune
 *
 *                   state:
 *                     type: string
 *                     example: Maharashtra
 *
 *                   country:
 *                     type: string
 *                     example: India
 *
 *                   postalCode:
 *                     type: string
 *                     pattern: "^[1-9][0-9]{5}$"
 *                     example: "411045"
 *
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *
 *       400:
 *         description: Validation error or invalid customer ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Customer not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch(
    '/customer/:id',
    CustomerLimiter,
    authMiddleware,
    updateCustomerValidator,
    validate,
    updateCustomer
);


/**
 * @swagger
 * /customer/{id}:
 *   delete:
 *     summary: Delete customer
 *     description: Deletes a specific customer belonging to the authenticated user.
 *     tags:
 *       - Customer
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Customer ID
 *         schema:
 *           type: string
 *           example: 6a6907f164a41a108c46d72f
 *
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *
 *       400:
 *         description: Invalid customer ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Customer not found
 *
 *       500:
 *         description: Internal server error
 */
router.delete(
    '/customer/:id',
    CustomerLimiter,
    authMiddleware,
    deleteCustomer
);


export default router;
