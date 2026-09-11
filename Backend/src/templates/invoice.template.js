/**
 * Renders a professional, strictly single-page A4 invoice with PDFKit.
 *
 * Usage:
 *   const doc = new PDFDocument({ size: "A4", margin: 36 });
 *   generateInvoiceTemplate(doc, invoice);
 *   doc.end();
 *
 * Optional invoice fields (all safe to omit):
 *   business: { businessName, address, email, phone, gstin, logo (Buffer|path),
 *               bankName, accountNumber, ifsc, upiId }
 *   customer: { customerName|name, address, email, phone, gstin }
 *   items:    [{ name|itemName, description, quantity, price }]
 *   invoiceNumber, invoiceDate, dueDate, status, paymentMethod,
 *   subTotal, totalTax, totalDiscount, grandTotal, amountPaid,
 *   notes, termsAndConditions
 */
const generateInvoiceTemplate = (doc, invoice = {}) => {
    // =====================================================
    // CONSTANTS
    // =====================================================
    const currency = "Rs.";

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 36;
    const left = margin;
    const right = pageWidth - margin;
    const contentWidth = pageWidth - margin * 2; // 523.28

    const color = {
        primary: "#0F172A",
        accent: "#1D4ED8",
        accentLight: "#EFF6FF",
        text: "#0F172A",
        muted: "#64748B",
        border: "#E2E8F0",
        zebra: "#F8FAFC",
        white: "#FFFFFF"
    };

    const statusColors = {
        PAID: { bg: "#ECFDF5", fg: "#047857" },
        PENDING: { bg: "#FFFBEB", fg: "#B45309" },
        DRAFT: { bg: "#F1F5F9", fg: "#475569" },
        OVERDUE: { bg: "#FEF2F2", fg: "#B91C1C" }
    };

    const footerLineY = pageHeight - 43;
    const rowHeight = 24;
    const tableHeadHeight = 22;
    const bottomSectionHeight = 172; // totals / words / notes / signature

    // =====================================================
    // HELPERS
    // =====================================================
    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    const toNumber = (value) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    };

    const formatMoney = (amount) =>
        `${currency} ${toNumber(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const renderAddress = (addr) => {
        if (!addr) return "";
        if (typeof addr === "string") return addr.trim();
        if (typeof addr !== "object") return "";
        return [
            addr.addressLine1,
            addr.addressLine2,
            [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
            addr.country
        ]
            .filter(Boolean)
            .join(", ");
    };

    // Amount in words (Indian numbering: thousand / lakh / crore)
    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
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

    // Finds the item's display name from the most common field names / nested refs.
    const getItemName = (item) => {
        const candidates = [
            item?.name, item?.itemName, item?.item_name, item?.productName, item?.product_name,
            item?.title, item?.label, item?.service, item?.serviceName,
            item?.product?.name, item?.product?.productName, item?.product?.title,
            item?.item?.name, item?.item?.itemName, item?.itemId?.name, item?.productId?.name,
            typeof item?.item === "string" ? item.item : null,
            typeof item?.product === "string" ? item.product : null
        ];
        const found = candidates.find((v) => typeof v === "string" && v.trim());
        // Last resort: use description as the name so the row is never blank
        return found || (typeof item?.description === "string" && item.description.trim()) || "Item";
    };

    // Single-line truncation based on measured width (font/size must be set first).
    const fit = (value, width) => {
        let str = String(value ?? "").replace(/\s+/g, " ").trim();
        if (doc.widthOfString(str) <= width) return str;
        while (str.length > 1 && doc.widthOfString(`${str}...`) > width) {
            str = str.slice(0, -1);
        }
        return `${str.trimEnd()}...`;
    };

    const line = (value, x, y, width, { font = "Helvetica", size = 8, fill = color.muted, align = "left" } = {}) => {
        doc.font(font).fontSize(size).fillColor(fill);
        doc.text(fit(value, width), x, y, { width, align, lineBreak: false });
    };

    const hRule = (y, weight = 0.5, stroke = color.border, x1 = left, x2 = right) => {
        doc.moveTo(x1, y).lineTo(x2, y).lineWidth(weight).strokeColor(stroke).stroke();
    };

    // =====================================================
    // SECTIONS
    // =====================================================
    const drawHeader = () => {
        // Top brand band
        doc.rect(0, 0, pageWidth, 8).fill(color.accent);

        const top = 30;
        const biz = invoice.business || {};
        const name = biz.businessName || "Business Name";

        // Logo (if provided) or initials badge
        const logoSize = 38;
        let drewLogo = false;
        if (biz.logo) {
            try {
                doc.image(biz.logo, left, top, { fit: [logoSize, logoSize] });
                drewLogo = true;
            } catch (_) { /* fall back to initials */ }
        }
        if (!drewLogo) {
            const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
            doc.roundedRect(left, top, logoSize, logoSize, 6).fill(color.accent);
            line(initials || "B", left, top + 12, logoSize, {
                font: "Helvetica-Bold", size: 15, fill: color.white, align: "center"
            });
        }

        // Business info
        const bx = left + logoSize + 10;
        const bw = 290 - logoSize;
        line(name, bx, top + 1, bw + 40, { font: "Helvetica-Bold", size: 16, fill: color.primary });
        let by = top + 22;
        const addr = renderAddress(biz.address);
        if (addr) { line(addr, bx, by, 330); by += 11; }
        const contact = [biz.email, biz.phone].filter(Boolean).join("   |   ");
        if (contact) { line(contact, bx, by, 330); by += 11; }
        if (biz.gstin) line(`GSTIN: ${biz.gstin}`, bx, by, 330, { font: "Helvetica-Bold", fill: color.text });

        // Right: title + meta
        const rx = 380;
        const rw = right - rx;
        line("INVOICE", rx, top - 2, rw, { font: "Helvetica-Bold", size: 26, fill: color.accent, align: "right" });

        let my = top + 34;
        [
            ["Invoice No", invoice.invoiceNumber || "-"],
            ["Invoice Date", formatDate(invoice.invoiceDate)],
            ["Due Date", formatDate(invoice.dueDate)]
        ].forEach(([label, value]) => {
            line(label, rx, my, 70, { size: 8 });
            line(value, rx + 70, my, rw - 70, { font: "Helvetica-Bold", size: 8.5, fill: color.text, align: "right" });
            my += 13;
        });

        // Status pill
        const status = String(invoice.status || "Pending").toUpperCase();
        const sc = statusColors[status] || { bg: color.accentLight, fg: color.accent };
        const pw = 78, ph = 17;
        const px = right - pw, py = my + 3;
        doc.lineWidth(0.8).roundedRect(px, py, pw, ph, 8.5).fillAndStroke(sc.bg, sc.fg);
        line(status, px, py + 5, pw, { font: "Helvetica-Bold", size: 7.5, fill: sc.fg, align: "center" });

        const dividerY = py + ph + 10;
        hRule(dividerY, 1, color.primary);
        return dividerY;
    };

    const drawCards = (y) => {
        const gap = 14;
        const w = (contentWidth - gap) / 2;
        const h = 84;
        const pad = 10;
        const biz = invoice.business || {};
        const cust = invoice.customer || {};

        // BILL TO
        doc.lineWidth(0.6).roundedRect(left, y, w, h, 4).fillAndStroke(color.zebra, color.border);
        doc.rect(left, y + 6, 3, h - 12).fill(color.accent);
        line("BILL TO", left + pad + 4, y + 9, w - 2 * pad, { font: "Helvetica-Bold", size: 7.5, fill: color.accent });

        const bx = left + pad + 4;
        const bw = w - 2 * pad - 4;
        line(cust.customerName || cust.name || "Customer Name", bx, y + 21, bw, {
            font: "Helvetica-Bold", size: 10, fill: color.text
        });

        const custAddr = renderAddress(cust.address);
        let cy = y + 36;
        if (custAddr) {
            doc.font("Helvetica").fontSize(8).fillColor(color.muted);
            doc.text(custAddr, bx, cy, { width: bw, height: 20, lineGap: 1, ellipsis: true });
            cy += 22;
        }
        if (cust.email) { line(cust.email, bx, cy, bw); cy += 11; }
        if (cust.phone) line(cust.phone, bx, cy, bw);

        // PAYMENT DETAILS
        const px = left + w + gap;
        doc.lineWidth(0.6).roundedRect(px, y, w, h, 4).fillAndStroke(color.zebra, color.border);
        doc.rect(px, y + 6, 3, h - 12).fill(color.accent);
        line("PAYMENT DETAILS", px + pad + 4, y + 9, w - 2 * pad, {
            font: "Helvetica-Bold", size: 7.5, fill: color.accent
        });

        const rows = [
            ["Payment Method", invoice.paymentMethod],
            ["Payment Status", invoice.status],
            ["Bank", biz.bankName],
            ["Account No", biz.accountNumber],
            ["IFSC", biz.ifsc],
            ["UPI ID", biz.upiId]
        ]
            .filter(([, v]) => v)
            .slice(0, 5);
        if (rows.length === 0) rows.push(["Payment Method", "-"]);

        let ry = y + 22;
        rows.forEach(([label, value]) => {
            line(label, px + pad + 4, ry, 90);
            line(value, px + pad + 94, ry, w - 2 * pad - 94, {
                font: "Helvetica-Bold", fill: color.text, align: "right"
            });
            ry += 12;
        });

        return y + h;
    };

    // Returns { cols, bodyTop, bodyBottom } and draws header + items + frame
    const drawItemsTable = (y, bodyBottom) => {
        const cols = {
            no: { x: left + 8, w: 22, align: "left" },
            desc: { x: left + 36, w: 225, align: "left" },
            qty: { x: left + 268, w: 45, align: "right" },
            price: { x: left + 320, w: 90, align: "right" },
            amount: { x: left + 415, w: 100, align: "right" }
        };

        // Header bar
        doc.rect(left, y, contentWidth, tableHeadHeight).fill(color.primary);
        [["no", "#"], ["desc", "ITEM DESCRIPTION"], ["qty", "QTY"], ["price", "RATE"], ["amount", "AMOUNT"]].forEach(
            ([key, label]) =>
                line(label, cols[key].x, y + 7, cols[key].w, {
                    font: "Helvetica-Bold", size: 7.5, fill: color.white, align: cols[key].align
                })
        );

        const bodyTop = y + tableHeadHeight;
        let cy = bodyTop;
        const items = Array.isArray(invoice.items) ? invoice.items : [];
        const maxRows = Math.max(1, Math.floor((bodyBottom - bodyTop) / rowHeight));
        const overflow = items.length > maxRows;
        const visible = overflow ? items.slice(0, maxRows - 1) : items;

        if (items.length === 0) {
            line("No items listed.", cols.desc.x, cy + 8, cols.desc.w);
        }

        visible.forEach((item, i) => {
            const qty = toNumber(item?.quantity);
            const price = toNumber(item?.price);

            if (i % 2 === 1) doc.rect(left, cy, contentWidth, rowHeight).fill(color.zebra);

            const hasDesc = Boolean(item?.description) && item.description !== getItemName(item);
            const ty = hasDesc ? cy + 5 : cy + 8;

            line(i + 1, cols.no.x, ty, cols.no.w);
            line(getItemName(item), cols.desc.x, ty, cols.desc.w, {
                font: "Helvetica-Bold", size: 8.5, fill: color.text
            });
            if (hasDesc) line(item.description, cols.desc.x, cy + 15, cols.desc.w, { size: 7 });
            line(qty, cols.qty.x, ty, cols.qty.w, { size: 8.5, fill: color.text, align: "right" });
            line(formatMoney(price), cols.price.x, ty, cols.price.w, { size: 8.5, fill: color.text, align: "right" });
            line(formatMoney(qty * price), cols.amount.x, ty, cols.amount.w, {
                font: "Helvetica-Bold", size: 8.5, fill: color.text, align: "right"
            });

            cy += rowHeight;
            hRule(cy, 0.4);
        });

        if (overflow) {
            line(`+ ${items.length - visible.length} more item(s) not shown`, cols.desc.x, cy + 8, cols.desc.w, {
                font: "Helvetica-Oblique"
            });
        }

        // Outer frame spanning the full body area (like a printed invoice)
        doc.lineWidth(0.6).strokeColor(color.border)
            .rect(left, bodyTop, contentWidth, bodyBottom - bodyTop).stroke();
        // Light column separators
        [cols.qty.x - 4, cols.price.x - 4, cols.amount.x - 4].forEach((x) => {
            doc.moveTo(x, bodyTop).lineTo(x, bodyBottom).lineWidth(0.3).strokeColor(color.border).stroke();
        });
    };

    const drawBottomSection = (y) => {
        const summaryW = 225;
        const summaryX = right - summaryW;
        const leftW = contentWidth - summaryW - 20;
        const biz = invoice.business || {};

        // ---- totals ----
        const items = Array.isArray(invoice.items) ? invoice.items : [];
        const computedSub = items.reduce((s, it) => s + toNumber(it?.quantity) * toNumber(it?.price), 0);
        const sub = toNumber(invoice.subTotal ?? computedSub);
        const tax = toNumber(invoice.totalTax);
        const disc = toNumber(invoice.totalDiscount);
        const grand = toNumber(invoice.grandTotal ?? sub + tax - disc);

        let sy = y + 4;
        [
            ["Subtotal", formatMoney(sub)],
            ["Discount", `- ${formatMoney(disc)}`],
            ["Tax", formatMoney(tax)]
        ].forEach(([label, value]) => {
            line(label, summaryX + 10, sy, 90, { size: 8.5 });
            line(value, summaryX + 10, sy, summaryW - 20, {
                font: "Helvetica-Bold", size: 8.5, fill: color.text, align: "right"
            });
            sy += 15;
        });

        hRule(sy, 0.6, color.border, summaryX, right);
        sy += 6;
        doc.roundedRect(summaryX, sy, summaryW, 28, 4).fill(color.primary);
        line("GRAND TOTAL", summaryX + 10, sy + 10, 100, { font: "Helvetica-Bold", size: 9, fill: color.white });
        line(formatMoney(grand), summaryX + 10, sy + 9, summaryW - 20, {
            font: "Helvetica-Bold", size: 11, fill: color.white, align: "right"
        });
        sy += 28;

        if (invoice.amountPaid !== undefined && invoice.amountPaid !== null) {
            const paid = toNumber(invoice.amountPaid);
            sy += 8;
            line("Amount Paid", summaryX + 10, sy, 90, { size: 8.5 });
            line(formatMoney(paid), summaryX + 10, sy, summaryW - 20, {
                font: "Helvetica-Bold", size: 8.5, fill: color.text, align: "right"
            });
            sy += 14;
            line("Balance Due", summaryX + 10, sy, 90, { font: "Helvetica-Bold", size: 9, fill: color.accent });
            line(formatMoney(Math.max(grand - paid, 0)), summaryX + 10, sy, summaryW - 20, {
                font: "Helvetica-Bold", size: 9, fill: color.accent, align: "right"
            });
        }

        // ---- amount in words ----
        doc.lineWidth(0.6).roundedRect(left, y, leftW, 48, 4).fillAndStroke(color.accentLight, color.border);
        line("AMOUNT IN WORDS", left + 10, y + 7, leftW - 20, { font: "Helvetica-Bold", size: 7, fill: color.accent });
        doc.font("Helvetica-Bold").fontSize(8).fillColor(color.text);
        doc.text(amountInWords(grand), left + 10, y + 18, { width: leftW - 20, height: 28, lineGap: 1, ellipsis: true });

        // ---- notes & terms ----
        const block = (title, text, by) => {
            line(title, left, by, leftW, { font: "Helvetica-Bold", size: 7.5, fill: color.text });
            doc.font("Helvetica").fontSize(7.5).fillColor(color.muted);
            doc.text(String(text), left, by + 11, { width: leftW, height: 26, lineGap: 1, ellipsis: true });
            return by + 44;
        };
        let ny = y + 58;
        if (invoice.notes) ny = block("NOTES", invoice.notes, ny);
        if (invoice.termsAndConditions) block("TERMS & CONDITIONS", invoice.termsAndConditions, ny);

        // ---- signature ----
        const sigY = y + bottomSectionHeight - 16;
        line(`For ${biz.businessName || "Business"}`, summaryX, sigY - 30, summaryW, {
            font: "Helvetica-Bold", size: 8.5, fill: color.text, align: "right"
        });
        hRule(sigY, 0.6, color.muted, summaryX + 45, right);
        line("Authorized Signatory", summaryX, sigY + 4, summaryW, { size: 7.5, align: "right" });
    };

    const drawFooter = () => {
        doc.rect(0, pageHeight - 8, pageWidth, 8).fill(color.accent);
        hRule(footerLineY, 0.5);
        line("Thank you for your business!", left, footerLineY + 6, contentWidth, {
            font: "Helvetica-Bold", size: 8.5, fill: color.accent, align: "center"
        });
        line(
            `${invoice.business?.businessName || "Business"}  \u2022  Invoice #${invoice.invoiceNumber || ""}  \u2022  This is a computer-generated invoice`,
            left, footerLineY + 18, contentWidth,
            { size: 7, align: "center" }
        );
    };

    // =====================================================
    // RENDER
    // =====================================================
    doc.info.Title = `Invoice ${invoice.invoiceNumber || ""}`;

    // Disable PDFKit's auto page-add near the bottom margin while rendering.
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    try {
        const dividerY = drawHeader();
        const cardsBottom = drawCards(dividerY + 12);

        const tableTop = cardsBottom + 14;
        const bottomTop = footerLineY - 12 - bottomSectionHeight;
        const bodyBottom = bottomTop - 8;

        drawItemsTable(tableTop, bodyBottom);
        drawBottomSection(bottomTop);
        drawFooter();
    } finally {
        doc.page.margins.bottom = prevBottom;
    }
};

export default generateInvoiceTemplate;