import PDFDocument from "pdfkit";
import generateInvoiceTemplate from "../templates/ invoice.template.js";


// This function receives the complete invoice object. and it generates a PDF and returns it as a Buffer.
const generateInvoicePDF = (invoice) => {

    const doc = new PDFDocument({ // Create a new PDF document.
        size: "A4",  //"A4" creates a standard A4 invoice.
        margin: 50  //50 gives 50px spacing from every page edge.
    });

    const buffers = []; // Store PDF data chunks while PDFKit generates the document.


    doc.on("data", (chunk) => { //Whenever PDFKit creates a chunk of PDF data, push it into the buffers array.
        buffers.push(chunk);
    });


    return new Promise((resolve, reject) => {  //Return a Promise because PDF generation is asynchronous.

        // This event fires when PDF generation is finished.
        doc.on("end", () => {

            const pdfBuffer = Buffer.concat(buffers); // Merge all chunks into one Buffer.

            resolve(pdfBuffer);  // Return the completed PDF.

        });

        doc.on("error", reject); //if error occur while generating the PDF, reject the Promise.

        // Draw invoice template
        generateInvoiceTemplate(doc, invoice);

        doc.end(); //Finish writing the PDF.

    });

};

export default generateInvoicePDF;