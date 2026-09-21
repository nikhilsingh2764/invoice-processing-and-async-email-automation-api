const generateInvoiceTemplate = (doc, invoice) => {

    const currency = "Rs.";

    const pageWidth = 595.28;
    const left = 45;
    const right = 45;
    const contentWidth = pageWidth - left - right;

    // =========================
    // Helper Functions
    // =========================

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatMoney = (amount = 0) => {
        return `${currency} ${Number(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const drawLine = (y) => {
        doc
            .moveTo(left, y)
            .lineTo(pageWidth - right, y)
            .lineWidth(0.5)
            .stroke();
    };

    const ensureSpace = (height = 50) => {
        if (doc.y + height > doc.page.height - 60) {
            doc.addPage();
        }
    };


    // =====================================================
    // HEADER
    // =====================================================

    doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .text(
            invoice.business?.businessName || "Business Name",
            left,
            45,
            {
                width: 300
            }
        );

    doc
        .font("Helvetica")
        .fontSize(9)
        .text(
            invoice.business?.email || "",
            left,
            doc.y + 5
        )
        .text(
            invoice.business?.phone || "",
            left
        )
        .text(
            invoice.business?.address || "",
            left,
            undefined,
            {
                width: 260
            }
        );


    // =========================
    // INVOICE LABEL
    // =========================

    doc
        .font("Helvetica-Bold")
        .fontSize(26)
        .text(
            "INVOICE",
            350,
            48,
            {
                width: 200,
                align: "right"
            }
        );


    // Invoice status

    const status = invoice.status || "Pending";

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
            status.toUpperCase(),
            390,
            82,
            {
                width: 160,
                align: "right"
            }
        );


    // Invoice information

    doc
        .font("Helvetica")
        .fontSize(9)
        .text(
            `Invoice #: ${invoice.invoiceNumber || "-"}`,
            350,
            105,
            {
                width: 200,
                align: "right"
            }
        )
        .text(
            `Invoice Date: ${formatDate(invoice.invoiceDate)}`,
            350,
            119,
            {
                width: 200,
                align: "right"
            }
        )
        .text(
            `Due Date: ${formatDate(invoice.dueDate)}`,
            350,
            133,
            {
                width: 200,
                align: "right"
            }
        );


    drawLine(165);


    // =====================================================
    // BILL TO / PAYMENT
    // =====================================================

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
            "BILL TO",
            left,
            185
        );

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
            "PAYMENT",
            350,
            185
        );


    // Customer

    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
            invoice.customer?.customerName ||
            invoice.customer?.name ||
            "Customer",
            left,
            205,
            {
                width: 260
            }
        );

    doc
        .font("Helvetica")
        .fontSize(9)
        .text(
            invoice.customer?.email || "",
            left,
            doc.y + 4,
            {
                width: 260
            }
        )
        .text(
            invoice.customer?.phone || "",
            left
        )
        .text(
            invoice.customer?.address || "",
            left,
            undefined,
            {
                width: 260
            }
        );


    // Payment details

    doc
        .font("Helvetica")
        .fontSize(9)
        .text(
            `Method: ${invoice.paymentMethod || "-"}`,
            350,
            205,
            {
                width: 200,
                align: "right"
            }
        )
        .text(
            `Status: ${invoice.status || "-"}`,
            350,
            220,
            {
                width: 200,
                align: "right"
            }
        );


    // =====================================================
    // ITEMS TABLE
    // =====================================================

    doc.y = Math.max(doc.y, 270);

    doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("ITEMS", left, doc.y);

    doc.moveDown(0.8);


    const tableTop = doc.y;

    const col = {
        no: left,
        description: left + 35,
        qty: 350,
        price: 410,
        amount: 490
    };


    // Table Header

    doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("#", col.no, tableTop, { width: 25 })
        .text("DESCRIPTION", col.description, tableTop, { width: 280 })
        .text("QTY", col.qty, tableTop, {
            width: 45,
            align: "right"
        })
        .text("PRICE", col.price, tableTop, {
            width: 70,
            align: "right"
        })
        .text("AMOUNT", col.amount, tableTop, {
            width: 60,
            align: "right"
        });

    drawLine(tableTop + 17);

    doc.y = tableTop + 27;


    // Items

    const items = invoice.items || [];

    items.forEach((item, index) => {

        ensureSpace(35);

        const itemName =
            item.name ||
            item.itemName ||
            "Item";

        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        const amount = quantity * price;

        const rowY = doc.y;

        doc
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                `${index + 1}`,
                col.no,
                rowY,
                {
                    width: 25
                }
            )
            .text(
                itemName,
                col.description,
                rowY,
                {
                    width: 270
                }
            )
            .text(
                quantity.toString(),
                col.qty,
                rowY,
                {
                    width: 45,
                    align: "right"
                }
            )
            .text(
                formatMoney(price),
                col.price,
                rowY,
                {
                    width: 70,
                    align: "right"
                }
            )
            .text(
                formatMoney(amount),
                col.amount,
                rowY,
                {
                    width: 60,
                    align: "right"
                }
            );

        doc.y += 22;

        drawLine(doc.y - 5);
    });


    // =====================================================
    // TOTALS
    // =====================================================

    ensureSpace(160);

    doc.moveDown(1);

    const summaryTop = doc.y;

    const labelX = 350;
    const valueX = 450;


    doc
        .font("Helvetica")
        .fontSize(9)
        .text(
            "Subtotal",
            labelX,
            summaryTop,
            {
                width: 90
            }
        )
        .text(
            formatMoney(invoice.subTotal),
            valueX,
            summaryTop,
            {
                width: 105,
                align: "right"
            }
        );


    doc
        .text(
            "Tax",
            labelX,
            summaryTop + 18,
            {
                width: 90
            }
        )
        .text(
            formatMoney(invoice.totalTax),
            valueX,
            summaryTop + 18,
            {
                width: 105,
                align: "right"
            }
        );


    doc
        .text(
            "Discount",
            labelX,
            summaryTop + 36,
            {
                width: 90
            }
        )
        .text(
            `- ${formatMoney(invoice.totalDiscount)}`,
            valueX,
            summaryTop + 36,
            {
                width: 105,
                align: "right"
            }
        );


    // Grand Total separator

    doc
        .moveTo(labelX, summaryTop + 58)
        .lineTo(pageWidth - right, summaryTop + 58)
        .stroke();


    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
            "TOTAL",
            labelX,
            summaryTop + 72,
            {
                width: 90
            }
        )
        .text(
            formatMoney(invoice.grandTotal),
            valueX,
            summaryTop + 70,
            {
                width: 105,
                align: "right"
            }
        );


    // =====================================================
    // NOTES
    // =====================================================

    let currentY = summaryTop + 115;

    if (invoice.notes) {

        ensureSpace(60);

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(
                "NOTES",
                left,
                currentY
            );

        doc
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                invoice.notes,
                left,
                currentY + 17,
                {
                    width: contentWidth
                }
            );

        currentY = doc.y + 15;
    }


    // =====================================================
    // TERMS & CONDITIONS
    // =====================================================

    if (invoice.termsAndConditions) {

        ensureSpace(70);

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(
                "TERMS & CONDITIONS",
                left,
                currentY
            );

        doc
            .font("Helvetica")
            .fontSize(8.5)
            .text(
                invoice.termsAndConditions,
                left,
                currentY + 17,
                {
                    width: contentWidth
                }
            );

        currentY = doc.y + 20;
    }


    // =====================================================
    // FOOTER
    // =====================================================

    const footerY = doc.page.height - 55;

    drawLine(footerY - 10);

    doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
            "Thank you for your business!",
            left,
            footerY,
            {
                width: contentWidth,
                align: "center"
            }
        );

    doc
        .font("Helvetica")
        .fontSize(7.5)
        .text(
            `${invoice.business?.businessName || "Business"} • Invoice ${invoice.invoiceNumber || ""}`,
            left,
            footerY + 15,
            {
                width: contentWidth,
                align: "center"
            }
        );
};


export default generateInvoiceTemplate;