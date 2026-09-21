import { Worker } from "bullmq";


import redis from "../config/redis.js";

import invoiceRepository from "../repository/invoice/invoice.repository.js";

import generateInvoicePDF  from "../utils/generateInvoicePDF.js";

import sendEmail from "../service/auth/email.service.js";

import logger from "../utils/logger.js"


const invoiceEmailWorker = new Worker("invoice-email", async (job) => {

    const {
        userId,
        invoiceId
    } = job.data;


    logger.info(`Processing invoice email job: ${job.id}`);


    // 1. Find invoice
    const invoice = await invoiceRepository.findById(
        userId,
        invoiceId
    );


    if (!invoice) {
        throw new Error("Invoice not found");
    }


    // 2. Generate PDF
    const pdfBuffer = await generateInvoicePDF(
        invoice
    );


    // 3. Send email with PDF
    await sendEmail({

        to: invoice.customer.email,

        subject: `Invoice ${invoice.invoiceNumber}`,

        html: `
                <h2>Invoice ${invoice.invoiceNumber}</h2>

                <p>
                    Please find your invoice attached.
                </p>
            `,

        attachments: [
            {
                content: pdfBuffer.toString("base64"),

                name: `${invoice.invoiceNumber}.pdf`
            }
        ]

    });


    logger.info(`Invoice email sent: ${invoice.invoiceNumber}`);


    return {
        invoiceNumber: invoice.invoiceNumber
    };

},

    {
        connection: redis,

        concurrency: 5
    }
);


invoiceEmailWorker.on("completed", (job) => {

    logger.info(`Invoice email job completed: ${job.id}`);

});


invoiceEmailWorker.on("failed", (job, error) => {

    logger.error({
        message: "Invoice email job failed",
        jobId: job?.id,
        error: error.message,
        stack: error.stack
    });



});


export default invoiceEmailWorker;