import PDFDocument from "pdfkit";
import generateInvoiceTemplate from "../templates/invoice.template.js";

const generateInvoicePDF = (invoice) => {
    // margin 36 matches the template's layout constants
    const doc = new PDFDocument({
        size: "A4",
        margin: 36,
        autoFirstPage: true,
        info: { Title: `Invoice ${invoice?.invoiceNumber || ""}` }
    });

    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        try {
            generateInvoiceTemplate(doc, invoice);
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

export default generateInvoicePDF;