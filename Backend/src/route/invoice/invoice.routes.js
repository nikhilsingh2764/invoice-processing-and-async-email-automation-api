import authMiddleware from '../../middleware/auth.middleware.js';

import express from "express";

import validate from '../../middleware/validate.js';

import {
    updateInvoiceValidator,
    createInvoiceValidator
} from '../../validators/invoice.validator.js';

import {
    createInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    downloadInvoicePDF,
    sendInvoiceEmail,
    duplicateInvoice
} from '../../controller/invoice/invoice.controller.js';

import {
    invoiceCreateLimiter,
    invoiceUpdateLimiter,
    invoiceDeleteLimiter,
    invoiceEmailLimiter,
    invoiceWhatsappLimiter,
    invoiceDuplicateLimiter,
    invoiceReadLimiter
} from '../../middleware/rateLimiter.middleware.js';


const router = express.Router();


/**
 * @swagger
 * tags:
 *   - name: Invoice
 *     description: Invoice management
 */


/**
 * @swagger
 * /invoice:
 *   post:
 *     summary: Create invoice
 *     description: Creates a new invoice for the authenticated user.
 *     tags:
 *       - Invoice
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
 *               - customerId
 *               - items
 *               - dueDate
 *             properties:
 *
 *               customerId:
 *                 type: string
 *                 description: MongoDB ID of the customer
 *                 example: 6a69080a64a41a108c46d730
 *
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 description: Products included in the invoice
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: MongoDB ID of the product
 *                       example: 6a6907cd64a41a108c46d72d
 *
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Invoice due date
 *                 example: "2026-08-10"
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - Draft
 *                   - Pending
 *                   - Paid
 *                   - Partially Paid
 *                   - Overdue
 *                   - Cancelled
 *                 example: Pending
 *
 *               paymentMethod:
 *                 type: string
 *                 enum:
 *                   - Cash
 *                   - UPI
 *                   - Credit Card
 *                   - Debit Card
 *                   - Bank Transfer
 *                   - Cheque
 *                 example: UPI
 *
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Invoice 8
 *
 *               termsAndConditions:
 *                 type: string
 *                 maxLength: 2000
 *                 example: Payment is due within 15 days.
 *
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Customer or product not found
 *
 *       500:
 *         description: Internal server error
 */
router.post(
    "/invoice",
    invoiceCreateLimiter,
    authMiddleware,
    createInvoiceValidator,
    validate,
    createInvoice
);


/**
 * @swagger
 * /invoice/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     description: Returns a specific invoice belonging to the authenticated user.
 *     tags:
 *       - Invoice
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *           example: 6a69093564a41a108c46d733
 *
 *     responses:
 *       200:
 *         description: Invoice fetched successfully
 *
 *       400:
 *         description: Invalid invoice ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Invoice not found
 *
 *       500:
 *         description: Internal server error
 */
router.get(
    "/invoice/:id",
    invoiceReadLimiter,
    authMiddleware,
    getInvoiceById
);


/**
 * @swagger
 * /invoice/{id}:
 *   patch:
 *     summary: Update invoice
 *     description: Updates one or more fields of an existing invoice.
 *     tags:
 *       - Invoice
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *           example: 6a69093564a41a108c46d733
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *
 *               customerId:
 *                 type: string
 *                 description: MongoDB ID of the customer
 *                 example: 6a69080a64a41a108c46d730
 *
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: MongoDB ID of the product
 *                       example: 6a6907cd64a41a108c46d72d
 *
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 3
 *
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-10"
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - Draft
 *                   - Pending
 *                   - Paid
 *                   - Partially Paid
 *                   - Overdue
 *                   - Cancelled
 *                 example: Pending
 *
 *               paymentMethod:
 *                 type: string
 *                 enum:
 *                   - Cash
 *                   - UPI
 *                   - Credit Card
 *                   - Debit Card
 *                   - Bank Transfer
 *                   - Cheque
 *                 example: UPI
 *
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Updated invoice after customer request
 *
 *               termsAndConditions:
 *                 type: string
 *                 maxLength: 2000
 *                 example: Payment is due within 15 days.
 *
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *
 *       400:
 *         description: Validation error or invalid invoice ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Invoice not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch(
    "/invoice/:id",
    invoiceUpdateLimiter,
    authMiddleware,
    updateInvoiceValidator,
    validate,
    updateInvoice
);


/**
 * @swagger
 * /invoice/{id}:
 *   delete:
 *     summary: Delete invoice
 *     description: Deletes a specific invoice belonging to the authenticated user.
 *     tags:
 *       - Invoice
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *           example: 6a69093564a41a108c46d733
 *
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *
 *       400:
 *         description: Invalid invoice ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Invoice not found
 *
 *       500:
 *         description: Internal server error
 */
router.delete(
    "/invoice/:id",
    invoiceDeleteLimiter,
    authMiddleware,
    deleteInvoice
);


/**
 * @swagger
 * /invoice/{id}/pdf:
 *   get:
 *     summary: Download invoice PDF
 *     description: Generates and downloads the PDF document for a specific invoice.
 *     tags:
 *       - Invoice
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *           example: 6a6909c864a41a108c46d734
 *
 *     responses:
 *       200:
 *         description: Invoice PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *
 *       400:
 *         description: Invalid invoice ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Invoice not found
 *
 *       500:
 *         description: Failed to generate invoice PDF
 */
router.get(
    "/invoice/:id/pdf",
    authMiddleware,
    downloadInvoicePDF
);


/**
 * @swagger
 * /invoice/{id}/email:
 *   post:
 *     summary: Send invoice by email
 *     description: Sends the invoice to the customer's email address with the invoice PDF attached.
 *     tags:
 *       - Invoice
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID
 *         schema:
 *           type: string
 *           example: 6a6909c864a41a108c46d734
 *
 *     responses:
 *       202:
 *         description: Invoice email job accepted for background processing
 *
 *       400:
 *         description: Invalid invoice ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Invoice not found
 *
 *       500:
 *         description: Failed to queue invoice email
 */
router.post(
    "/invoice/:id/email",
    invoiceEmailLimiter,
    authMiddleware,
    sendInvoiceEmail
);


/**
 * @swagger
 * /invoice/{id}/duplicate:
 *   post:
 *     summary: Duplicate invoice
 *     description: Creates a new invoice by duplicating an existing invoice.
 *     tags:
 *       - Invoice
 *
 *     security:
 *       - accessTokenCookie: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Invoice ID to duplicate
 *         schema:
 *           type: string
 *           example: 6a6909c864a41a108c46d734
 *
 *     responses:
 *       201:
 *         description: Invoice duplicated successfully
 *
 *       400:
 *         description: Invalid invoice ID
 *
 *       401:
 *         description: Authentication required
 *
 *       404:
 *         description: Invoice not found
 *
 *       500:
 *         description: Internal server error
 */
router.post(
    "/invoice/:id/duplicate",
    invoiceDuplicateLimiter,
    authMiddleware,
    duplicateInvoice
);


export default router;
