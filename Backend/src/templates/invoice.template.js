import PDFDocument from "pdfkit";

/**
 * Renders a crisp, highly professional single-page A4 invoice using PDFKit.
 *
 * Usage:
 *   const doc = new PDFDocument({ size: "A4", margin: 36 });
 *   generateInvoiceTemplate(doc, invoice);
 *   doc.end();
 */
const generateInvoiceTemplate = (doc, invoice = {}) => {
    // =====================================================
    // CONFIG & DESIGN CONSTANTS
    // =====================================================
    const currency = "₹"; // Updated to standard symbol

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 36;
    const left = margin;
    const right = pageWidth - margin;
    const contentWidth = pageWidth - margin * 2; // 523.28

    const color = {
        primary: "#0F172A",     // Dark Slate
        accent: "#2563EB",      // Vibrant Blue
        accentBg: "#F0F6FF",    // Soft Blue Fill
        text: "#1E293B",        // Body Text
        muted: "#64748B",       // Subtitles / Labels
        lightMuted: "#94A3B8",  // Subtle borders / accents
        border: "#E2E8F0",      // Light Gray Rule
        zebra: "#F8FAFC",       // Very Light Slate
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
    // HELPER FUNCTIONS
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
        `${currency} ${toNumber(amount).toLocaleString("en-IN", {
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

    // Amount in Words
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const twoDigits = (n) => (n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : ""));
    const threeDigits = (n) => {
        const h = Math.floor(n / 100);
        const r = n % 100;
        return (h ? `${ones[h]} Hundred${r ? " " : ""}` : "") + (r ? twoDigits(r) : "");
    };
    const intWords = (n) => {
        if (n === 0) return "Zero";
        const parts = [];
        const crore = Math.floor(n / 1e7);
        const lakh = Math.floor(n / 1e5) % 100;
        const thousand = Math.floor(n / 1e3) % 100;
        const rest = n % 1000;
        if (crore) parts.push(`${intWords(crore)} Crore`);
        if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
        if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
        if (rest) parts.push(threeDigits(rest));
        return parts.join(" ");
    };
    const amountInWords = (amount) => {
        const abs = Math.abs(toNumber(amount));
        let rupees = Math.floor(abs);
        let paise = Math.round((abs - rupees) * 100);
        if (paise === 100) { rupees += 1; paise = 0; }
        return `Rupees ${intWords(rupees)}${paise ? ` and ${twoDigits(paise)} Paise` : ""} Only`;
    };

    const getItemName = (item) => {
        return (
            item?.name || item?.itemName || item?.productName || item?.title || item?.service || item?.description || "Item"
        );
    };

    // Text truncation
    const fit = (val, width) => {
        let str = String(val ?? "").replace(/\s+/g, " ").trim();
        if (doc.widthOfString(str) <= width) return str;
        while (str.length > 1 && doc.widthOfString(`${str}...`) > width) {
            str = str.slice(0, -1);
        }
        return `${str.trimEnd()}...`;
    };

    const line = (val, x, y, width, { font = "Helvetica", size = 8, fill = color.text, align = "left" } = {}) => {
        doc.font(font).fontSize(size).fillColor(fill);
        doc.text(fit(val, width), x, y, { width, align, lineBreak: false });
    };

    const hRule = (y, weight = 0.5, stroke = color.border, x1 = left, x2 = right) => {
        doc.moveTo(x1, y).lineTo(x2, y).lineWidth(weight).strokeColor(stroke).stroke();
    };

    // =====================================================
    // RENDERING SECTIONS
    // =====================================================

    // Top Header Section
    const drawHeader = () => {
        const top = margin;
        const biz = invoice.business || {};
        const bizName = biz.businessName || "Your Company Name";

        // Business Initials Logo Badge
        const logoSize = 42;
        const initials = bizName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join("");

        doc.roundedRect(left, top, logoSize, logoSize, 8).fill(color.accent);
        line(initials || "B", left, top + 12, logoSize, {
            font: "Helvetica-Bold",
            size: 16,
            fill: color.white,
            align: "center",
        });

        // Company Details (Left)
        const bx = left + logoSize + 12;
        line(bizName, bx, top + 2, 280, { font: "Helvetica-Bold", size: 14, fill: color.primary });
        
        let by = top + 20;
        const addr = renderAddress(biz.address);
        if (addr) {
            doc.font("Helvetica").fontSize(8).fillColor(color.muted);
            doc.text(addr, bx, by, { width: 280, height: 24, lineGap: 1 });
            by += doc.heightOfString(addr, { width: 280 }) + 2;
        }

        const contactInfo = [biz.email, biz.phone].filter(Boolean).join("  •  ");
        if (contactInfo) {
            line(contactInfo, bx, by, 280, { size: 8, fill: color.muted });
            by += 11;
        }
        if (biz.gstin) {
            line(`GSTIN: ${biz.gstin}`, bx, by, 280, { font: "Helvetica-Bold", size: 8, fill: color.text });
        }

        // Invoice Meta Header (Right)
        const rx = 360;
        const rw = right - rx;
        
        line("INVOICE", rx, top, rw, {
            font: "Helvetica-Bold",
            size: 24,
            fill: color.primary,
            align: "right",
        });

        // Status Badge
        const status = String(invoice.status || "Pending").toUpperCase();
        const sc = statusColors[status] || { bg: color.accentBg, fg: color.accent };
        const pw = 68, ph = 15;
        const px = right - pw, py = top + 28;
        
        doc.roundedRect(px, py, pw, ph, 4).fill(sc.bg);
        line(status, px, py + 4, pw, {
            font: "Helvetica-Bold",
            size: 7,
            fill: sc.fg,
            align: "center",
        });

        // Metadata Table
        let my = top + 52;
        const meta = [
            ["Invoice No:", invoice.invoiceNumber || "-"],
            ["Invoice Date:", formatDate(invoice.invoiceDate)],
            ["Due Date:", formatDate(invoice.dueDate)],
        ];

        meta.forEach(([label, val]) => {
            line(label, rx, my, 80, { size: 8, fill: color.muted, align: "right" });
            line(val, rx + 85, my, rw - 85, { font: "Helvetica-Bold", size: 8, fill: color.primary, align: "right" });
            my += 13;
        });

        const headerBottom = Math.max(by, my) + 12;
        hRule(headerBottom, 1, color.border);
        return headerBottom;
    };

    // Client & Payment Info Cards
    const drawInfoSection = (y) => {
        const gap = 16;
        const cardW = (contentWidth - gap) / 2;
        const cardH = 82;
        const cust = invoice.customer || {};
        const biz = invoice.business || {};

        // Bill To Box (Modern Border-Left Accent Style)
        doc.roundedRect(left, y, cardW, cardH, 6).fill(color.zebra);
        doc.roundedRect(left, y, 4, cardH, 2).fill(color.accent);

        line("BILLED TO", left + 12, y + 10, cardW - 20, { font: "Helvetica-Bold", size: 7, fill: color.accent });
        line(cust.customerName || cust.name || "Valued Customer", left + 12, y + 22, cardW - 20, {
            font: "Helvetica-Bold",
            size: 10,
            fill: color.primary,
        });

        let cy = y + 36;
        const custAddr = renderAddress(cust.address);
        if (custAddr) {
            doc.font("Helvetica").fontSize(7.5).fillColor(color.muted);
            doc.text(custAddr, left + 12, cy, { width: cardW - 20, height: 20, lineGap: 1 });
            cy += 20;
        }
        if (cust.email) {
            line(cust.email, left + 12, cy, cardW - 20, { size: 7.5, fill: color.muted });
            cy += 10;
        }
        if (cust.phone) line(cust.phone, left + 12, cy, cardW - 20, { size: 7.5, fill: color.muted });

        // Payment Details Box
        const px = left + cardW + gap;
        doc.roundedRect(px, y, cardW, cardH, 6).fill(color.zebra);
        doc.roundedRect(px, y, 4, cardH, 2).fill(color.primary);

        line("PAYMENT INFO", px + 12, y + 10, cardW - 20, { font: "Helvetica-Bold", size: 7, fill: color.primary });

        const payRows = [
            ["Method", invoice.paymentMethod],
            ["Bank", biz.bankName],
            ["Account No", biz.accountNumber],
            ["IFSC Code", biz.ifsc],
            ["UPI ID", biz.upiId],
        ].filter(([, v]) => Boolean(v)).slice(0, 4);

        if (payRows.length === 0) payRows.push(["Status", invoice.status || "Pending"]);

        let py = y + 23;
        payRows.forEach(([lbl, val]) => {
            line(lbl, px + 12, py, 75, { size: 7.5, fill: color.muted });
            line(val, px + 85, py, cardW - 97, { font: "Helvetica-Bold", size: 7.5, fill: color.text, align: "right" });
            py += 12;
        });

        return y + cardH + 16;
    };

    // Itemized Table
    const drawTable = (startY, endY) => {
        const cols = {
            no: { x: left + 10, w: 20, align: "left" },
            item: { x: left + 35, w: 235, align: "left" },
            qty: { x: left + 275, w: 45, align: "right" },
            rate: { x: left + 325, w: 85, align: "right" },
            amount: { x: left + 415, w: 98, align: "right" },
        };

        const headHeight = 22;

        // Table Header
        doc.roundedRect(left, startY, contentWidth, headHeight, 4).fill(color.primary);
        [
            ["no", "#"],
            ["item", "DESCRIPTION"],
            ["qty", "QTY"],
            ["rate", "RATE"],
            ["amount", "AMOUNT"],
        ].forEach(([key, label]) => {
            line(label, cols[key].x, startY + 7, cols[key].w, {
                font: "Helvetica-Bold",
                size: 7.5,
                fill: color.white,
                align: cols[key].align,
            });
        });

        // Table Rows
        let cy = startY + headHeight + 4;
        const rowHeight = 22;
        const items = Array.isArray(invoice.items) ? invoice.items : [];
        const maxRows = Math.floor((endY - cy) / rowHeight);
        const visibleItems = items.slice(0, maxRows);

        visibleItems.forEach((item, idx) => {
            const qty = toNumber(item?.quantity);
            const price = toNumber(item?.price);
            const total = qty * price;

            // Zebra Striping
            if (idx % 2 === 1) {
                doc.roundedRect(left, cy - 2, contentWidth, rowHeight, 2).fill(color.zebra);
            }

            line(idx + 1, cols.no.x, cy + 4, cols.no.w, { size: 8, fill: color.muted });
            line(getItemName(item), cols.item.x, cy + 4, cols.item.w, {
                font: "Helvetica-Bold",
                size: 8,
                fill: color.text,
            });
            line(qty, cols.qty.x, cy + 4, cols.qty.w, { size: 8, fill: color.text, align: "right" });
            line(formatMoney(price), cols.rate.x, cy + 4, cols.rate.w, { size: 8, fill: color.text, align: "right" });
            line(formatMoney(total), cols.amount.x, cy + 4, cols.amount.w, {
                font: "Helvetica-Bold",
                size: 8,
                fill: color.text,
                align: "right",
            });

            cy += rowHeight;
        });

        if (items.length > maxRows) {
            line(`+ ${items.length - maxRows} more item(s) omitted`, cols.item.x, cy + 4, cols.item.w, {
                font: "Helvetica-Oblique",
                size: 7.5,
                fill: color.muted,
            });
        }

        hRule(endY, 1, color.border);
    };

    // Summary, Notes & Signatures
    const drawBottomSection = (y) => {
        const summaryW = 210;
        const summaryX = right - summaryW;
        const leftW = contentWidth - summaryW - 20;
        const biz = invoice.business || {};

        // Totals Calculation
        const items = Array.isArray(invoice.items) ? invoice.items : [];
        const computedSub = items.reduce((acc, item) => acc + toNumber(item?.quantity) * toNumber(item?.price), 0);
        const sub = toNumber(invoice.subTotal ?? computedSub);
        const tax = toNumber(invoice.totalTax);
        const disc = toNumber(invoice.totalDiscount);
        const grand = toNumber(invoice.grandTotal ?? sub + tax - disc);

        // Right Box: Totals Breakdown
        let sy = y + 4;
        const totals = [
            ["Subtotal", formatMoney(sub)],
            ["Discount", `- ${formatMoney(disc)}`],
            ["Estimated Tax", formatMoney(tax)],
        ];

        totals.forEach(([lbl, val]) => {
            line(lbl, summaryX, sy, 100, { size: 8, fill: color.muted });
            line(val, summaryX + 100, sy, summaryW - 100, { font: "Helvetica-Bold", size: 8, fill: color.text, align: "right" });
            sy += 14;
        });

        hRule(sy + 2, 0.5, color.border, summaryX, right);
        sy += 8;

        // Grand Total Block
        doc.roundedRect(summaryX, sy, summaryW, 26, 4).fill(color.accentBg);
        line("TOTAL DUE", summaryX + 10, sy + 8, 90, { font: "Helvetica-Bold", size: 8, fill: color.accent });
        line(formatMoney(grand), summaryX + 100, sy + 7, summaryW - 110, {
            font: "Helvetica-Bold",
            size: 11,
            fill: color.accent,
            align: "right",
        });

        sy += 32;

        if (invoice.amountPaid !== undefined && invoice.amountPaid !== null) {
            const paid = toNumber(invoice.amountPaid);
            const balance = Math.max(grand - paid, 0);

            line("Amount Paid", summaryX, sy, 100, { size: 8, fill: color.muted });
            line(formatMoney(paid), summaryX + 100, sy, summaryW - 100, { size: 8, fill: color.text, align: "right" });
            sy += 12;

            line("Balance Remaining", summaryX, sy, 100, { font: "Helvetica-Bold", size: 8, fill: color.primary });
            line(formatMoney(balance), summaryX + 100, sy, summaryW - 100, {
                font: "Helvetica-Bold",
                size: 8,
                fill: color.primary,
                align: "right",
            });
        }

        // Left Box: Amount in Words
        doc.roundedRect(left, y + 4, leftW, 40, 4).fill(color.zebra);
        line("AMOUNT IN WORDS", left + 8, y + 10, leftW - 16, { font: "Helvetica-Bold", size: 6.5, fill: color.muted });
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(color.text);
        doc.text(amountInWords(grand), left + 8, y + 20, { width: leftW - 16, height: 20, ellipsis: true });

        // Left Box: Notes & Terms
        let ny = y + 50;
        if (invoice.notes) {
            line("NOTES", left, ny, leftW, { font: "Helvetica-Bold", size: 7, fill: color.muted });
            doc.font("Helvetica").fontSize(7.5).fillColor(color.text);
            doc.text(invoice.notes, left, ny + 9, { width: leftW, height: 22, ellipsis: true });
            ny += 32;
        }

        if (invoice.termsAndConditions) {
            line("TERMS & CONDITIONS", left, ny, leftW, { font: "Helvetica-Bold", size: 7, fill: color.muted });
            doc.font("Helvetica").fontSize(7).fillColor(color.muted);
            doc.text(invoice.termsAndConditions, left, ny + 9, { width: leftW, height: 22, ellipsis: true });
        }

        // Right Box: Signature
        const sigY = footerY - 35;
        line(`For ${biz.businessName || "Authorized Business"}`, summaryX, sigY, summaryW, {
            font: "Helvetica-Bold",
            size: 7.5,
            fill: color.text,
            align: "right",
        });

        hRule(sigY + 22, 0.5, color.lightMuted, summaryX + 60, right);
        line("Authorized Signature", summaryX, sigY + 26, summaryW, { size: 7, fill: color.muted, align: "right" });
    };

    // Footer Line
    const drawFooter = () => {
        hRule(footerY - 10, 0.5, color.border);

        line("Thank you for your business!", left, footerY, contentWidth, {
            font: "Helvetica-Bold",
            size: 8,
            fill: color.accent,
            align: "center",
        });

        line(
            `${invoice.business?.businessName || "Invoice"}  •  Computer Generated Document`,
            left,
            footerY + 11,
            contentWidth,
            { size: 7, fill: color.lightMuted, align: "center" }
        );
    };

    // =====================================================
    // MAIN EXECUTION LOGIC
    // =====================================================
    doc.info.Title = `Invoice - ${invoice.invoiceNumber || "Draft"}`;

    // Temporarily adjust bottom margin to prevent accidental multi-page splits
    const originalMarginBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    try {
        const headerBottom = drawHeader();
        const cardsBottom = drawInfoSection(headerBottom + 12);

        const bottomHeight = 135;
        const bottomSectionTop = footerY - 15 - bottomHeight;
        const tableBottom = bottomSectionTop - 10;

        drawTable(cardsBottom, tableBottom);
        drawBottomSection(bottomSectionTop);
        drawFooter();
    } finally {
        doc.page.margins.bottom = originalMarginBottom;
    }
};

export default generateInvoiceTemplate;
