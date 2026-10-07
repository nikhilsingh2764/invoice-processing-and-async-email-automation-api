import express from 'express';

import validate from '../../middleware/validate.js';

import authMiddleware from '../../middleware/auth.middleware.js';

import {
    createBusinessValidator,
    updateBusinessValidator
} from '../../validators/business.validator.js';

import {
    createBusiness,
    getBusinessProfile,
    updateBusiness,
    deleteBusiness
} from '../../controller/invoice/business.controller.js';

import {
    businessLimiter
} from '../../middleware/rateLimiter.middleware.js';


const router = express.Router();


/**
 * @swagger
 * tags:
 *   - name: Business
 *     description: Business profile management
 */


/**
 * @swagger
 * /business:
 *   post:
 *     summary: Create business profile
 *     description: Creates a business profile for the authenticated user.
 *     tags:
 *       - Business
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
 *               - businessName
 *               - ownerName
 *               - email
 *               - phone
 *               - address
 *               - currency
 *             properties:
 *
 *               businessName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Nextpen Solutions Pvt Ltd
 *
 *               ownerName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Rahul Gandhi
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: skyline.tech@example.com
 *
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{10}$"
 *                 example: "9123456783"
 *
 *               gstNumber:
 *                 type: string
 *                 minLength: 15
 *                 maxLength: 15
 *                 pattern: "^[0-9A-Za-z]{15}$"
 *                 example: 27ABCDE1234F1Z5
 *
 *               address:
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
 *                     example: 45 Park Street
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
 *                     example: "400001"
 *
 *               currency:
 *                 type: string
 *                 enum:
 *                   - USD
 *                   - EUR
 *                   - GBP
 *                   - JPY
 *                   - INR
 *                   - CHF
 *                   - CAD
 *                   - AUD
 *                   - CNY
 *                   - RUB
 *                   - BRL
 *                   - ZAR
 *                   - MXN
 *                   - SGD
 *                   - SEK
 *                   - KRW
 *                   - HKD
 *                   - NZD
 *                   - TRY
 *                   - IDR
 *                   - ILS
 *                 example: INR
 *
 *               signature:
 *                 type: string
 *                 example: https://example.com/rahul-signature.png
 *
 *               logo:
 *                 type: string
 *                 example: https://example.com/skyline-logo.png
 *
 *               invoicePrefix:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *                 example: SKY
 *
 *               invoiceStartNumber:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1001
 *
 *               termsAndConditions:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Payment is due within 15 days.
 *
 *     responses:
 *       201:
 *         description: Business profile created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required
 *
 *       409:
 *         description: Business profile already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post(
    "/business",
    businessLimiter,
    authMiddleware,
    createBusinessValidator,
    validate,
    createBusiness
);


/**
 * @swagger
 * /business:
 *   get:
 *     summary: Get business profile
 *     description: Returns the business profile of the authenticated user.
 *     tags:
 *       - Business
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: Business profile fetched successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Business profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    "/business",
    authMiddleware,
    getBusinessProfile
);


/**
 * @swagger
 * /business:
 *   delete:
 *     summary: Delete business profile
 *     description: Deletes the business profile of the authenticated user.
 *     tags:
 *       - Business
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     responses:
 *       200:
 *         description: Business profile deleted successfully
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Business profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/business",
    businessLimiter,
    authMiddleware,
    deleteBusiness
);


/**
 * @swagger
 * /business:
 *   patch:
 *     summary: Update business profile
 *     description: Updates one or more fields of the authenticated user's business profile.
 *     tags:
 *       - Business
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
 *             properties:
 *
 *               businessName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Nextpen Pvt Ltd
 *
 *               ownerName:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Rahul Gandhi
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: skyline.tech@example.com
 *
 *               phone:
 *                 type: string
 *                 pattern: "^[0-9]{10}$"
 *                 example: "9123456783"
 *
 *               gstNumber:
 *                 type: string
 *                 minLength: 15
 *                 maxLength: 15
 *                 pattern: "^[0-9A-Za-z]{15}$"
 *                 example: 27ABCDE1234F1Z5
 *
 *               address:
 *                 type: object
 *                 properties:
 *
 *                   addressLine1:
 *                     type: string
 *                     example: 45 Park Street
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
 *                     example: "400001"
 *
 *               currency:
 *                 type: string
 *                 enum:
 *                   - USD
 *                   - EUR
 *                   - GBP
 *                   - JPY
 *                   - INR
 *                   - CHF
 *                   - CAD
 *                   - AUD
 *                   - CNY
 *                   - RUB
 *                   - BRL
 *                   - ZAR
 *                   - MXN
 *                   - SGD
 *                   - SEK
 *                   - KRW
 *                   - HKD
 *                   - NZD
 *                   - TRY
 *                   - IDR
 *                   - ILS
 *                 example: INR
 *
 *               signature:
 *                 type: string
 *                 example: https://example.com/rahul-signature.png
 *
 *               logo:
 *                 type: string
 *                 example: https://example.com/skyline-logo.png
 *
 *               invoicePrefix:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 10
 *                 example: SKY
 *
 *               invoiceStartNumber:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1001
 *
 *               termsAndConditions:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Payment is due within 15 days.
 *
 *     responses:
 *       200:
 *         description: Business profile updated successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Business profile not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch(
    "/business",
    businessLimiter,
    authMiddleware,
    updateBusinessValidator,
    validate,
    updateBusiness
);


export default router;
