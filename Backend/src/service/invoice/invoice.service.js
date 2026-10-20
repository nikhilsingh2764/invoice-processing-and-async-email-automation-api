import ApiError from "../../utils/ApiError.js";

import invoiceRepository from "../../repository/invoice/invoice.repository.js";
import businessRepository from "../../repository/invoice/business.repository.js";
import customerRepository from "../../repository/invoice/customer.repository.js";

import { buildInvoiceItems } from "../../helper/invoice.helper.js";

import mongoose from "mongoose";
import redis from "../../config/redis.js";

import { invoicePDFQueue } from "../../queues/invoicePDF.queue.js";
import { invoiceEmailQueue } from "../../queues/invoiceEmail.queue.js";

import logger from "../../utils/logger.js";
import translate from "../../utils/translate.js";

import { encryptBuffer, decryptBuffer } from "../../utils/encryption.js";

// Create Invoice
export const createInvoiceService = async (userData, language = "en") => {
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async () => {
            const { userId, customerId, items, dueDate, paymentMethod, notes, status } = userData;

            // Increment invoice number with session
            const business = await businessRepository.incrementInvoiceNumber(userId, session);

            if (!business) {
                logger.warn(`Invoice creation failed - business profile not found: ${userId}`);
                throw new ApiError(404, translate("BUSINESS.BUSINESS_NOT_FOUND", language));
            }

            // Find customer belonging to user with session
            const customer = await customerRepository.findByIdAndUserId(
                customerId,
                userId,
                session
            );

            if (!customer) {
                logger.warn(`Invoice creation failed - customer not found: ${customerId}`);
                throw new ApiError(404, translate("CUSTOMER.CUSTOMER_NOT_FOUND", language));
            }

            // Build invoice items with session
            const { invoiceItems, subTotal, totalTax, totalDiscount, grandTotal } =
                await buildInvoiceItems(items, userId, session);

            const invoiceNumber = `${business.invoicePrefix}-${business.nextInvoiceNumber}`;

            // Create invoice with session
            const invoice = await invoiceRepository.create(
                {
                    userId,
                    business: {
                        businessName: business.businessName,
                        ownerName: business.ownerName,
                        email: business.email,
                        phone: business.phone,
                        gstNumber: business.gstNumber,
                        logo: business.logo,
                        signature: business.signature,
                        currency: business.currency,
                        address: business.address,
                    },
                    customer: {
                        customerName: customer.customerName,
                        email: customer.email,
                        phone: customer.phone,
                        companyName: customer.companyName,
                        gstNumber: customer.gstNumber,
                        customerType: customer.customerType,
                        notes: customer.notes,
                        billingAddress: customer.billingAddress,
                        shippingAddress: customer.shippingAddress,
                    },
                    items: invoiceItems,
                    invoiceNumber,
                    subTotal,
                    totalTax,
                    totalDiscount,
                    grandTotal,
                    dueDate,
                    paymentMethod,
                    notes,
                    termsAndConditions: business.termsAndConditions,
                    status,
                },
                session
            );

            logger.info(`Invoice created successfully: ${invoice._id}`);
            return invoice;
        });
    } catch (error) {
        logger.error(`Invoice creation failed: ${error.message}`);
        throw error;
    } finally {
        await session.endSession();
    }
};

// Get Invoice By ID
export const getInvoiceByIdService = async (userId, invoiceId, language = "en") => {
    const cacheKey = `invoice:${invoiceId}:${userId}`;

    // Check Redis
    const cachedInvoice = await redis.get(cacheKey);

    if (cachedInvoice) {
        logger.info(`Invoice cache hit: ${invoiceId}`);

        return JSON.parse(cachedInvoice);
    }

    logger.info(`Invoice cache miss: ${invoiceId}`);

    // Get from MongoDB
    const invoice = await invoiceRepository.findById(userId, invoiceId);

    if (!invoice) {
        logger.warn(`Invoice not found: ${invoiceId}`);

        throw new ApiError(404, translate("INVOICE.INVOICE_NOT_FOUND", language));
    }

    // Store in Redis
    await redis.set(cacheKey, JSON.stringify(invoice), "EX", 600);

    logger.info(`Invoice fetched from DB and cached: ${invoiceId}`);

    return invoice;
};

// Update Invoice
export const updateInvoiceService = async (userId, invoiceId, rawUpdatedData, language = "en") => {
    const session = await mongoose.startSession();

    try {
        const updatedInvoice = await session.withTransaction(async () => {
            const allowedUpdates = [
                "items",
                "dueDate",
                "paymentMethod",
                "notes",
                "status",
                "customerId",
            ];

            const updatedData = {};
            for (const key of allowedUpdates) {
                if (rawUpdatedData[key] !== undefined) {
                    updatedData[key] = rawUpdatedData[key];
                }
            }

            // Check invoice ownership with session
            const invoice = await invoiceRepository.findById(userId, invoiceId, session);
            if (!invoice) {
                logger.warn(`Invoice update attempted for non-existing invoice: ${invoiceId}`);
                throw new ApiError(404, translate("INVOICE.INVOICE_NOT_FOUND", language));
            }

            // Rebuild invoice items and totals if items changed
            if (updatedData.items) {
                const { invoiceItems, subTotal, totalTax, totalDiscount, grandTotal } =
                    await buildInvoiceItems(updatedData.items, userId, session);

                updatedData.items = invoiceItems;
                updatedData.subTotal = subTotal;
                updatedData.totalTax = totalTax;
                updatedData.totalDiscount = totalDiscount;
                updatedData.grandTotal = grandTotal;
            }

            // Update customer snapshot if customerId changed
            if (updatedData.customerId) {
                const customer = await customerRepository.findByIdAndUserId(
                    updatedData.customerId,
                    userId,
                    session
                );
                if (!customer) {
                    logger.warn(
                        `Invoice update failed - customer not found: ${updatedData.customerId}`
                    );
                    throw new ApiError(404, translate("CUSTOMER.CUSTOMER_NOT_FOUND", language));
                }

                updatedData.customer = {
                    customerName: customer.customerName,
                    email: customer.email,
                    phone: customer.phone,
                    companyName: customer.companyName,
                    gstNumber: customer.gstNumber,
                    customerType: customer.customerType,
                    notes: customer.notes,
                    billingAddress: customer.billingAddress,
                    shippingAddress: customer.shippingAddress,
                };

                delete updatedData.customerId;
            }

            // Update MongoDB using session
            const result = await invoiceRepository.updateById(
                userId,
                invoiceId,
                updatedData,
                session
            );

            if (!result) {
                logger.error(`Invoice update failed: ${invoiceId}`);
                throw new ApiError(500, translate("INVOICE.INVOICE_UPDATE_FAILED", language));
            }

            return result;
        });

        // Invalidate caches after successful transaction commit
        await redis.del(`invoice:${invoiceId}:${userId}`);
        await redis.del(`invoice:pdf:${userId}:${invoiceId}`);

        logger.info(`Invoice updated successfully: ${invoiceId}`);
        return updatedInvoice;
    } catch (error) {
        logger.error(`Invoice update failed: ${error.message}`);
        throw error;
    } finally {
        await session.endSession();
    }
};

// Delete Invoice
export const deleteInvoiceService = async (userId, invoiceId, language = "en") => {
    const invoiceExist = await invoiceRepository.existsById(userId, invoiceId);

    if (!invoiceExist) {
        logger.warn(`Invoice deletion attempted for non-existing invoice: ${invoiceId}`);

        throw new ApiError(404, translate("INVOICE.INVOICE_NOT_FOUND", language));
    }

    await invoiceRepository.deleteById(userId, invoiceId);

    // Invalidate invoice cache
    await redis.del(`invoice:${invoiceId}:${userId}`);

    // Invalidate PDF cache
    await redis.del(`invoice:pdf:${userId}:${invoiceId}`);

    logger.info(`Invoice deleted successfully: ${invoiceId}`);

    return null;
};

// Download Invoice PDF
export const downloadInvoicePDFService = async (userId, invoiceId, language = "en") => {
    // 1. Check invoice exists first to get its invoiceNumber and updatedAt
    const invoice = await invoiceRepository.findById(userId, invoiceId);

    if (!invoice) {
        logger.warn(`PDF generation requested for non-existing invoice: ${invoiceId}`);
        throw new ApiError(404, translate("INVOICE.INVOICE_NOT_FOUND", language));
    }

    // 2. Put updatedAt in the cache key to prevent stale-cache race conditions
    const cacheKey = `invoice:pdf:${userId}:${invoiceId}:${invoice.updatedAt.getTime()}`;

    // 3. Check PDF cache with the versioned key
    const cachedPDFBuffer = await redis.getBuffer(cacheKey);

    if (cachedPDFBuffer) {
        logger.info(`Invoice PDF cache hit: ${invoiceId}`);

        // Decrypt the buffer before returning
        const decryptedPDF = decryptBuffer(cachedPDFBuffer);

        return {
            pdfBuffer: decryptedPDF,
            invoiceNumber: invoice.invoiceNumber, // Fixed: Returns real invoice number instead of ID
        };
    }

    logger.info(`Invoice PDF cache miss: ${invoiceId}`);

    // 4. Add PDF generation job to queue (passing updatedAt if needed by worker)
    const job = await invoicePDFQueue.add(
        "generate-invoice-pdf",
        {
            userId: userId.toString(),
            invoiceId: invoiceId.toString(),
            updatedAtTime: invoice.updatedAt.getTime(),
            language,
        },
        {
            attempts: 3, // Retry up to 3 times if it fails
            backoff: {
                type: "exponential",
                delay: 2000, // Wait 2 seconds before the first retry, then increases
            },
        }
    );

    logger.info(`Invoice PDF generation job queued: ${job.id}`);

    return {
        jobId: job.id,
        message: translate("PDF.PDF_DOWNLOAD_STARTED", language),
    };
};

// Send Invoice Email
export const sendInvoiceEmailService = async (userId, invoiceId, language = "en") => {
    // Check invoice exists
    const invoice = await invoiceRepository.findById(userId, invoiceId);

    if (!invoice) {
        logger.warn(`Invoice email requested for non-existing invoice: ${invoiceId}`);

        throw new ApiError(404, translate("INVOICE.INVOICE_NOT_FOUND", language));
    }

    // Add invoice email job
    const job = await invoiceEmailQueue.add(
        "send-invoice-email",
        {
            userId: userId.toString(),
            invoiceId: invoiceId.toString(),
            language,
        },
        {
            attempts: 3, // Retry up to 3 times if it fails
            backoff: {
                type: "exponential",
                delay: 3000, // Wait 3 seconds before the first retry, then increases
            },
        }
    );

    logger.info(`Invoice email job queued: ${job.id}`);

    return {
        jobId: job.id,
        message: translate("EMAIL.INVOICE_EMAIL_QUEUED", language),
    };
};

// Duplicate Invoice
export const duplicateInvoiceService = async (userId, invoiceId, language = "en") => {
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(async () => {
            // Find original invoice with session
            const invoice = await invoiceRepository.findById(userId, invoiceId, session);

            if (!invoice) {
                logger.warn(`Invoice duplication attempted for non-existing invoice: ${invoiceId}`);
                throw new ApiError(404, translate("INVOICE.INVOICE_NOT_FOUND", language));
            }

            // Generate next invoice number atomically with session (prevents sequence gaps)
            const updatedBusiness = await businessRepository.incrementInvoiceNumber(
                userId,
                session
            );

            if (!updatedBusiness) {
                logger.warn(`Invoice duplication failed - business profile not found: ${userId}`);
                throw new ApiError(404, translate("BUSINESS.BUSINESS_NOT_FOUND", language));
            }

            const invoiceNumber = `${updatedBusiness.invoicePrefix}-${updatedBusiness.nextInvoiceNumber}`;

            const duplicateInvoice = invoice.toObject();

            delete duplicateInvoice._id;
            delete duplicateInvoice.__v;
            delete duplicateInvoice.createdAt;
            delete duplicateInvoice.updatedAt;

            const paymentDuration = new Date(invoice.dueDate) - new Date(invoice.invoiceDate);

            duplicateInvoice.invoiceNumber = invoiceNumber;
            duplicateInvoice.status = "Draft";
            duplicateInvoice.invoiceDate = new Date();
            duplicateInvoice.dueDate = new Date(
                duplicateInvoice.invoiceDate.getTime() + paymentDuration
            );

            duplicateInvoice.sent = false;
            duplicateInvoice.sentAt = null;

            // Create duplicated invoice using session
            const newInvoice = await invoiceRepository.create(duplicateInvoice, session);

            if (!newInvoice) {
                logger.error(`Invoice duplication failed: ${invoiceId}`);
                throw new ApiError(500, translate("INVOICE.INVOICE_CREATE_FAILED", language));
            }

            logger.info(`Invoice duplicated successfully: ${newInvoice._id}`);
            return newInvoice;
        });
    } catch (error) {
        logger.error(`Invoice duplication failed: ${error.message}`);
        throw error;
    } finally {
        await session.endSession();
    }
};
