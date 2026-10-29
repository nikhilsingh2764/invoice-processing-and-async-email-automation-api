import PDFDocument from "pdfkit";

/**
 * Renders a professional, single-page A4 invoice matching your exact app layout.
 *
 * Usage:
 *   const doc = new PDFDocument({ size: "A4", margin: 36 });
 *   generateInvoiceTemplate(doc, invoice);
 *   doc.end();
 */
const generateInvoiceTemplate = (doc, invoice = {}) => {
    // =====================================================
    // CONSTANTS & SETUP
    // =====================================================
    const currency = "₹";
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 36;
    const left = margin;
    const right = pageWidth - margin;
    const contentWidth = pageWidth - margin * 2; // 523.28

    const color = {
        primary: "#0F172A",     // Dark slate text
        accent: "#16A34A",      // Green accent / status
        accentBg: "#DCFCE7",    // Soft green background
        text: "#1E293B",
        muted: "#64748B",       // Labels
        border: "#E2E8F0",      // Light divider lines
        zebra: "#F8FAFC",
        white: "#FFFFFF",
    };

    const statusColors = {
        PAID: { bg: "#DCFCE7", fg: "#15803D" },
        PENDING: { bg: "#FEF3C7", fg: "#B45309" },
        DRAFT: { bg: "#F1F5F9", fg: "#475569" },
        OVERDUE: { bg: "#FEE2E2", fg: "#B91C1C" },
    };

    const footerY = pageHeight - 45;

    // =====================================================
    // HELPERS
    // =====================================================
    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        return Number.isNaN(d.getTime())
            ? "-"
            : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const toNumber = (val) => {
        const n = Number(val);
        return Number.isFinite(n) ? n : 0;
    };

    const formatMoney = (amount) =>
        `${currency}${toNumber(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const renderAddress = (addr) => {
        if (!addr) return "";
        if (typeof addr === "string") return addr.trim();
        if (typeof addr !== "object") return "";
        return [
            addr.addressLine1,
            addr.addressLine2,
            [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
            addr.country,
        ]
            .filter(Boolean)
            .join("\n");
    };

    const line = (val, x, y, width, { font = "Helvetica", size = 8, fill = color.text, align = "left" } = {}) => {
        doc.font(font).fontSize(size).fillColor(fill);
        doc.text(String(val ?? ""), x, y, { width, align, lineBreak: false });
    };

    const hRule = (y, weight = 0.5, stroke = color.border, x1 = left, x2 = right) => {
        doc.moveTo(x1, y).lineTo(x2, y).lineWidth(weight).strokeColor(stroke).stroke();
    };

    // =====================================================
    // RENDERING SECTIONS
    // =====================================================

    // 1. Top Header & Status Badge
    const drawHeader = () => {
        const top = margin;
        const biz = invoice.business || {};
        const bizName = biz.businessName || "Business Name";

        // Business Name & Subtitle
        line(bizName, left, top, 350, { font: "Helvetica-Bold", size: 16, fill: color.primary });
        if (biz.ownerName || biz.subtitle) {
            line(biz.ownerName || biz.subtitle, left, top + 18, 350, { size: 9, fill: color.muted });
        }

        // Status Badge (Top Right)
        const status = String(invoice.status || "PENDING").toUpperCase();
        const sc = statusColors[status] || { bg: color.accentBg, fg: color.accent };
        const pw = 64, ph = 18;
        const px = right - pw, py = top;

        doc.roundedRect(px, py, pw, ph, 4).fill(sc.bg);
        line(status, px, py + 5, pw, {
            font: "Helvetica-Bold",
            size: 8,
            fill: sc.fg,
            align: "center",
        });

        return top + 36;
    };

    // 2. Four Stat / Meta Boxes (Invoice no., Issued, Due, Total)
    const drawMetaCards = (y) => {
        const itemsCount = invoice.items || [];
        const computedSub = itemsCount.reduce((s, it) => s + toNumber(it?.quantity) * toNumber(it?.price), 0);
        const grand = toNumber(invoice.grandTotal ?? computedSub + toNumber(invoice.totalTax) - toNumber(invoice.totalDiscount));

        const cards = [
            { label: "Invoice no.", value: invoice.invoiceNumber || "-" },
            { label: "Issued", value: formatDate(invoice.invoiceDate) },
            { label: "Due", value: formatDate(invoice.dueDate) },
            { label: "Total", value: formatMoney(grand) },
        ];

        const cardW = contentWidth / 4;
        let cx = left;

        cards.forEach((card, idx) => {
            // Optional subtle background box for cards
            doc.roundedRect(cx, y, cardW - 8, 36, 4).fill(color.zebra);
            
            line(card.label.toUpperCase(), cx + 8, y + 6, cardW - 24, { font: "Helvetica", size: 6.5, fill: color.muted });
            line(card.value, cx + 8, y + 17, cardW - 24, { font: "Helvetica-Bold", size: 9.5, fill: color.primary });

            cx += cardW;
        });

        return y + 46;
    };

    // 3. From & Bill To Side-by-Side Section
    const drawParties = (y) => {
        const biz = invoice.business || {};
        const cust = invoice.customer || {};
        const colW = contentWidth / 2 - 10;

        // FROM Section
        let fy = y;
        line("From", left, fy, colW, { font: "Helvetica-Bold", size: 8, fill: color.muted });
        fy += 12;
        line(biz.businessName || "Business", left, fy, colW, { font: "Helvetica-Bold", size: 10, fill: color.primary });
        fy += 14;

        const fromDetails = [
            biz.email,
            biz.phone,
            biz.gstin ? `GSTIN: ${biz.gstin}` : null,
            renderAddress(biz.address),
        ].filter(Boolean);

        fromDetails.forEach((text) => {
            doc.font("Helvetica").fontSize(8).fillColor(color.muted);
            doc.text(text, left, fy, { width: colW, lineGap: 1 });
            fy += doc.heightOfString(text, { width: colW }) + 2;
        });

        // BILL TO Section
        const rx = left + contentWidth / 2 + 10;
        let ry = y;
        line("Bill to", rx, ry, colW, { font: "Helvetica-Bold", size: 8, fill: color.muted });
        ry += 12;
        line(cust.customerName || cust.name || "Customer Name", rx, ry, colW, { font: "Helvetica-Bold", size: 10, fill: color.primary });
        ry += 14;

        const billDetails = [
            cust.companyName || cust.company,
            cust.email,
            cust.phone,
            cust.gstin ? `GSTIN: ${cust.gstin}` : null,
            renderAddress(cust.address),
        ].filter(Boolean);

        billDetails.forEach((text) => {
            doc.font("Helvetica").fontSize(8).fillColor(color.muted);
            doc.text(text, rx, ry, { width: colW, lineGap: 1 });
            ry += doc.heightOfString(text, { width: colW }) + 2;
        });

        return Math.max(fy, ry) + 16;
    };

    // 4. Items Table
    const drawTable = (startY, endY) => {
        const cols = {
            no: { x: left + 6, w: 20, align: "left" },
            item: { x: left + 35, w: 215, align: "left" },
            qty: { x: left + 255, w: 60, align: "right" },
            price: { x: left + 325, w: 65, align: "right" },
            tax: { x: left + 400, w: 45, align: "right" },
            amount: { x: left + 455, w: 68, align: "right" },
        };

        // Table Header Line
        hRule(startY, 0.6, color.border);
        const headerY = startY + 6;

        [
            ["no", "Item"],
            ["qty", "Qty"],
            ["price", "Price"],
            ["tax", "Tax"],
            ["amount", "Amount"],
        ].forEach(([key, label]) => {
            line(label, cols[key].x, headerY, cols[key].w, {
                font: "Helvetica-Bold",
                size: 7.5,
                fill: color.muted,
                align: cols[key].align,
            });
        });

        hRule(headerY + 14, 0.6, color.border);

        // Table Rows
        let cy = headerY + 20;
        const rowHeight = 26;
        const items = Array.isArray(invoice.items) ? invoice.items : [];
        const maxRows = Math.floor((endY - cy) / rowHeight);
        const visibleItems = items.slice(0, maxRows);

        visibleItems.forEach((item, idx) => {
            const qty = toNumber(item?.quantity);
            const price = toNumber(item?.price);
            const itemTax = item?.tax ? `${toNumber(item.tax)}%` : "0%";
            const total = qty * price;
            const itemName = item?.name || item?.itemName || item?.productName || "Item";
            const itemDesc = item?.description || "";

            line(idx + 1, cols.no.x, cy + 4, cols.no.w, { size: 8, fill: color.muted });
            
            // Item Name & Sub-description
            line(itemName, cols.item.x, cy + 3, cols.item.w, { font: "Helvetica-Bold", size: 8.5, fill: color.primary });
            if (itemDesc) {
                line(itemDesc, cols.item.x, cy + 13, cols.item.w, { size: 7, fill: color.muted });
            }

            line(`${qty} ${item?.unit || "piece"}`, cols.qty.x, cy + 6, cols.qty.w, { size: 8, fill: color.text, align: "right" });
            line(formatMoney(price), cols.price.x, cy + 6, cols.price.w, { size: 8, fill: color.text, align: "right" });
            line(itemTax, cols.tax.x, cy + 6, cols.tax.w, { size: 8, fill: color.text, align: "right" });
            line(formatMoney(total), cols.amount.x, cy + 6, cols.amount.w, { font: "Helvetica-Bold", size: 8, fill: color.primary, align: "right" });

            cy += rowHeight;
            hRule(cy - 4, 0.4, color.border);
        });
    };

    // 5. Totals & Payment Method Footer Section
    const drawBottomSection = (y) => {
        const summaryW = 220;
        const summaryX = right - summaryW;

        const items = Array.isArray(invoice.items) ? invoice.items : [];
        const computedSub = items.reduce((acc, it) => acc + toNumber(it?.quantity) * toNumber(it?.price), 0);
        const sub = toNumber(invoice.subTotal ?? computedSub);
        const tax = toNumber(invoice.totalTax);
        const grand = toNumber(invoice.grandTotal ?? sub + tax);

        let sy = y;
        const totals = [
            ["Subtotal", formatMoney(sub)],
            ["Tax", formatMoney(tax)],
        ];

        totals.forEach(([lbl, val]) => {
            line(lbl, summaryX, sy, 100, { size: 8, fill: color.muted });
            line(val, summaryX + 100, sy, summaryW - 100, { font: "Helvetica-Bold", size: 8, fill: color.text, align: "right" });
            sy += 14;
        });

        hRule(sy + 2, 0.6, color.border, summaryX, right);
        sy += 8;

        // Total row
        line("Total", summaryX, sy, 100, { font: "Helvetica-Bold", size: 10, fill: color.primary });
        line(formatMoney(grand), summaryX + 100, sy - 1, summaryW - 100, {
            font: "Helvetica-Bold",
            size: 11,
            fill: color.primary,
            align: "right",
        });

        // Payment Method (Bottom Left)
        const payMethod = invoice.paymentMethod || "UPI";
        line(`Payment method: ${payMethod}`, left, footerY - 20, 300, { font: "Helvetica-Bold", size: 8, fill: color.primary });

        // Dotted Divider above footer
        doc.dash(2, { space: 2 });
        hRule(footerY - 8, 0.5, color.border);
        doc.undash();
    };

    // =====================================================
    // EXECUTION
    // =====================================================
    doc.info.Title = `Invoice - ${invoice.invoiceNumber || "Draft"}`;

    const originalMarginBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    try {
        const headerBottom = drawHeader();
        const metaBottom = drawMetaCards(headerBottom + 10);
        const partiesBottom = drawParties(metaBottom + 14);

        const bottomSectionTop = footerY - 55;
        drawTable(partiesBottom, bottomSectionTop - 15);
        drawBottomSection(bottomSectionTop);
    } finally {
        doc.page.margins.bottom = originalMarginBottom;
    }
};

export default generateInvoiceTemplate;
