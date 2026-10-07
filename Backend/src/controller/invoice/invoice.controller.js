import ApiResponse from "../../utils/ApiResponse.js";
import TryCatch from "../../middleware/TryCatch.js";
import ApiError from "../../utils/ApiError.js";
import translate from "../../utils/translate.js";

import {
    createInvoiceService,
    getInvoiceByIdService,
    updateInvoiceService,
    deleteInvoiceService,
    downloadInvoicePDFService,
    sendInvoiceEmailService,
    duplicateInvoiceService
} from "../../service/invoice/invoice.service.js";

import { invoicePDFQueue } from "../../queues/invoicePDF.queue.js";
import { invoiceEmailQueue } from "../../queues/invoiceEmail.queue.js";



export const createInvoice = TryCatch(async (req, res) => {

    const userData = {
        ...req.body,
        userId: req.user._id
    };

    const invoice = await createInvoiceService(
        userData,
        req.language
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            translate(
                "INVOICE.INVOICE_CREATED",
                req.language
            ),
            invoice
        )
    );

});



export const getInvoiceById = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: invoiceId
    } = req.params;

    const invoice = await getInvoiceByIdService(
        userId,
        invoiceId,
        req.language
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "INVOICE.INVOICE_FETCHED",
                req.language
            ),
            invoice
        )
    );

});



export const updateInvoice = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: invoiceId
    } = req.params;

    const updatedData = req.body;

    const updatedInvoice =
        await updateInvoiceService(
            userId,
            invoiceId,
            updatedData,
            req.language
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "INVOICE.INVOICE_UPDATED",
                req.language
            ),
            updatedInvoice
        )
    );

});



export const deleteInvoice = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: invoiceId
    } = req.params;

    await deleteInvoiceService(
        userId,
        invoiceId,
        req.language
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "INVOICE.INVOICE_DELETED",
                req.language
            ),
            null
        )
    );

});



export const downloadInvoicePDF = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: invoiceId
    } = req.params;


    const result =
        await downloadInvoicePDFService(
            userId,
            invoiceId,
            req.language
        );


    // PDF already exists in Redis
    if (result.pdfBuffer) {

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Length",
            result.pdfBuffer.length
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${result.invoiceNumber}.pdf"`
        );

        return res.send(result.pdfBuffer);
    }


    // PDF generation started
    return res.status(202).json({
        success: true,
        message: translate(
            "PDF.PDF_DOWNLOAD_STARTED",
            req.language
        ),
        jobId: result.jobId
    });

});



export const getInvoicePDFStatus = TryCatch(async (req, res) => {

    const {
        jobId
    } = req.params;

    const job =
        await invoicePDFQueue.getJob(jobId);


    if (!job) {
        throw new ApiError(
            404,
            translate(
                "PDF.PDF_JOB_NOT_FOUND",
                req.language
            )
        );
    }


    const state =
        await job.getState();


    return res.status(200).json({
        success: true,
        jobId: job.id,
        status: state
    });

});



export const sendInvoiceEmail = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: invoiceId
    } = req.params;


    const result =
        await sendInvoiceEmailService(
            userId,
            invoiceId,
            req.language
        );


    return res.status(202).json({
        success: true,
        message: translate(
            "EMAIL.INVOICE_EMAIL_QUEUED",
            req.language
        ),
        jobId: result.jobId
    });

});



export const getInvoiceEmailStatus = TryCatch(async (req, res) => {

    const {
        jobId
    } = req.params;

    const job =
        await invoiceEmailQueue.getJob(jobId);


    if (!job) {
        throw new ApiError(
            404,
            translate(
                "EMAIL.EMAIL_JOB_NOT_FOUND",
                req.language
            )
        );
    }


    const status =
        await job.getState();


    return res.status(200).json({
        success: true,
        jobId: job.id,
        status
    });

});



export const duplicateInvoice = TryCatch(async (req, res) => {

    const userId = req.user._id;

    const {
        id: invoiceId
    } = req.params;


    const duplicatedInvoice =
        await duplicateInvoiceService(
            userId,
            invoiceId,
            req.language
        );


    return res.status(200).json(
        new ApiResponse(
            200,
            translate(
                "INVOICE.INVOICE_DUPLICATED",
                req.language
            ),
            duplicatedInvoice
        )
    );

});