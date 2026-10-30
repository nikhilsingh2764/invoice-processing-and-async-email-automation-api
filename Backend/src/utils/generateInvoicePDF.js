import PDFDocument from "pdfkit";
import generateInvoiceTemplate from "../templates/invoice.template.js";

/**
 * Builds the invoice PDF and resolves with a Buffer.
 * Theme: "dark" (default, matches the app) or "light" (print-friendly). Set INVOICE_PDF_THEME=light to switch.
 */
const generateInvoicePDF = (invoice, options = {}) => {
    const theme = options.theme || process.env.INVOICE_PDF_THEME || "dark";

    // The template lays everything out itself, so margins are 0 and pages are buffered for "Page x of y".
    const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        autoFirstPage: true,
        bufferPages: true,
        info: { Title: `Invoice ${invoice?.invoiceNumber || ""}` },
    });

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        try {
            generateInvoiceTemplate(doc, invoice, { ...options, theme });
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

export default generateInvoicePDF;
