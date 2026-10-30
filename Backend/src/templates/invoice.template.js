import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Invoice PDF layout (A4). Mirrors the on-screen invoice card:
 *   header (business + status stamp) -> meta strip -> From / Bill to -> items table
 *   -> totals -> dotted divider -> payment method, notes, terms.
 *
 * - Dark "card" look by default (matches the app); pass { theme: "light" } for a print-friendly version.
 * - Embeds DejaVu Sans Condensed so the rupee sign (and other currency symbols) render correctly.
 *   The built-in Helvetica font cannot draw "₹".
 * - Flows onto extra pages when there are many items; nothing is ever cut off.
 */

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "fonts");
const FONT_REGULAR = path.join(FONT_DIR, "DejaVuSansCondensed.ttf");
const FONT_BOLD = path.join(FONT_DIR, "DejaVuSansCondensed-Bold.ttf");

const THEMES = {
    dark: {
        page: "#0F0E0D",
        card: "#181614",
        border: "#2B2723",
        rule: "#2B2723",
        ink: "#F5EFE9",
        muted: "#A99D93",
        accentText: "#E9A56B", // contact + address lines
        owner: "#AFA8E8",
        dots: "#6F655D",
        status: {
            Paid: { bg: "#14301F", fg: "#86EFAC" },
            Pending: { bg: "#3A2A0A", fg: "#FCD34D" },
            Overdue: { bg: "#3F1414", fg: "#FCA5A5" },
            "Partially Paid": { bg: "#14264A", fg: "#93C5FD" },
            Draft: { bg: "#2B2926", fg: "#D6D3D1" },
            Cancelled: { bg: "#3A1440", fg: "#F0ABFC" },
            Sent: { bg: "#14264A", fg: "#93C5FD" },
        },
    },
    light: {
        page: "#FFFFFF",
        card: "#FFFFFF",
        border: "#E2E8F0",
        rule: "#E2E8F0",
        ink: "#0F172A",
        muted: "#64748B",
        accentText: "#B45309",
        owner: "#4F46E5",
        dots: "#94A3B8",
        status: {
            Paid: { bg: "#DCFCE7", fg: "#166534" },
            Pending: { bg: "#FEF3C7", fg: "#92400E" },
            Overdue: { bg: "#FEE2E2", fg: "#B91C1C" },
            "Partially Paid": { bg: "#DBEAFE", fg: "#1D4ED8" },
            Draft: { bg: "#E7E5E4", fg: "#44403C" },
            Cancelled: { bg: "#FAE8FF", fg: "#86198F" },
            Sent: { bg: "#DBEAFE", fg: "#1D4ED8" },
        },
    },
};

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$", AED: "AED ", JPY: "¥" };

const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const generateInvoiceTemplate = (doc, invoice = {}, options = {}) => {
    const C = THEMES[options.theme] || THEMES.dark;
    const timeZone = options.timeZone || process.env.INVOICE_TIMEZONE || "Asia/Kolkata";

    // ---------- Page geometry ----------
    const W = 595.28;
    const H = 841.89;
    const OUTER = 24; // gap between paper edge and card
    const PAD = 30; // card inner padding
    const cardX = OUTER;
    const cardW = W - OUTER * 2;
    const left = cardX + PAD;
    const contentW = cardW - PAD * 2;
    const right = left + contentW;
    const top = OUTER + PAD;
    const bottom = H - OUTER - PAD - 12; // keep room for the small page footer

    const biz = invoice.business || {};
    const cust = invoice.customer || {};
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const currencyCode = String(biz.currency || invoice.currency || "INR").toUpperCase();
    const symbol = CURRENCY_SYMBOLS[currencyCode] ?? `${currencyCode} `;

    // ---------- Helpers ----------
    const money = (v) =>
        `${symbol}${num(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const formatDate = (d) => {
        if (!d) return "-";
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return "-";
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone }).format(date);
    };

    const addressLines = (a) => {
        if (!a) return [];
        if (typeof a === "string") return a.split("\n").map((l) => l.trim()).filter(Boolean);
        return [a.addressLine1, a.addressLine2, [a.city, a.state, a.postalCode].filter(Boolean).join(", "), a.country].filter(Boolean);
    };

    const setFont = (bold, size, color) => doc.font(bold ? "Bold" : "Regular").fontSize(size).fillColor(color);

    /** Single line of text, clipped with an ellipsis instead of wrapping or overflowing. */
    const line = (str, x, y, w, { bold = false, size = 9, color = C.ink, align = "left" } = {}) => {
        setFont(bold, size, color);
        doc.text(String(str ?? ""), x, y, { width: w, align, lineBreak: false, ellipsis: true, height: size * 1.4 });
    };

    /** Wrapped block; returns its height. */
    const block = (str, x, y, w, { bold = false, size = 9, color = C.ink, lineGap = 1.5, align = "left" } = {}) => {
        setFont(bold, size, color);
        const h = doc.heightOfString(String(str), { width: w, lineGap });
        doc.text(String(str), x, y, { width: w, lineGap, align });
        return h;
    };

    const heightOf = (str, w, size, bold = false, lineGap = 1.5) => {
        setFont(bold, size, "#000");
        return doc.heightOfString(String(str), { width: w, lineGap });
    };

    const hRule = (y, x1 = left, x2 = right, color = C.rule, weight = 0.6) =>
        doc.save().moveTo(x1, y).lineTo(x2, y).lineWidth(weight).strokeColor(color).stroke().restore();

    const dots = (y) => {
        doc.save().fillColor(C.dots);
        for (let x = left + 2; x < right; x += 9) doc.circle(x, y, 0.9).fill();
        doc.restore();
    };

    // ---------- Pages ----------
    let pageNo = 0;
    const paintPage = () => {
        pageNo += 1;
        doc.save();
        doc.rect(0, 0, W, H).fill(C.page);
        doc.roundedRect(cardX, OUTER, cardW, H - OUTER * 2, 14).lineWidth(0.8).fillAndStroke(C.card, C.border);
        doc.restore();
    };
    const nextPage = () => {
        doc.addPage({ size: "A4", margin: 0 });
        paintPage();
        return top;
    };

    // ---------- Sections ----------
    const drawHeader = (y) => {
        const status = String(invoice.status || "Pending");
        const sc = C.status[status] || C.status.Pending;

        // Status stamp (top right, slightly rotated like the app)
        const label = status.toUpperCase();
        setFont(true, 8.5, sc.fg);
        const tw = doc.widthOfString(label, { characterSpacing: 1 });
        const pw = tw + 22;
        const ph = 21;
        const px = right - pw - 2;
        const py = y + 2;
        doc.save();
        doc.rotate(-3, { origin: [px + pw / 2, py + ph / 2] });
        doc.roundedRect(px, py, pw, ph, 4).lineWidth(1.3).fillAndStroke(sc.bg, sc.fg);
        setFont(true, 8.5, sc.fg);
        doc.text(label, px, py + 6.3, { width: pw, align: "center", characterSpacing: 1, lineBreak: false });
        doc.restore();

        const nameW = contentW - pw - 20;
        line(biz.businessName || "Your business", left, y, nameW, { bold: true, size: 20, color: C.ink });
        if (biz.ownerName) line(biz.ownerName, left, y + 27, nameW, { size: 9.5, color: C.owner });
        return y + (biz.ownerName ? 50 : 38);
    };

    const drawMeta = (y) => {
        const cells = [
            ["Invoice no.", invoice.invoiceNumber || "-"],
            ["Issued", formatDate(invoice.invoiceDate)],
            ["Due", formatDate(invoice.dueDate)],
            ["Total", money(invoice.grandTotal)],
        ];
        const cw = contentW / 4;
        const h = 50;
        hRule(y);
        hRule(y + h);
        cells.forEach(([label, value], i) => {
            const x = left + cw * i;
            const inset = i === 0 ? 0 : 12;
            if (i > 0) doc.save().moveTo(x, y + 9).lineTo(x, y + h - 9).lineWidth(0.6).strokeColor(C.rule).stroke().restore();
            line(label, x + inset, y + 10, cw - inset - 6, { size: 7.5, color: C.muted });
            line(value, x + inset, y + 24, cw - inset - 6, { bold: true, size: i === 3 ? 13.5 : 12, color: C.ink });
        });
        return y + h;
    };

    const drawParties = (y) => {
        const gap = 28;
        const colW = (contentW - gap) / 2;
        const draw = (title, name, details, x) => {
            let cy = y;
            line(title, x, cy, colW, { size: 7.5, color: C.muted });
            cy += 14;
            const nh = block(name || "-", x, cy, colW, { bold: true, size: 12.5, color: C.ink, lineGap: 0 });
            cy += nh + 5;
            details.forEach((d) => {
                cy += block(d, x, cy, colW, { size: 8.5, color: C.accentText, lineGap: 0.5 }) + 2.5;
            });
            return cy;
        };
        const fromY = draw(
            "From",
            biz.businessName,
            [biz.email, biz.phone, biz.gstNumber && `GST ${biz.gstNumber}`, ...addressLines(biz.address)].filter(Boolean),
            left,
        );
        const toY = draw(
            "Bill to",
            cust.customerName || cust.name,
            [cust.companyName, cust.email, cust.phone, cust.gstNumber && `GST ${cust.gstNumber}`, ...addressLines(cust.billingAddress || cust.address)].filter(Boolean),
            left + colW + gap,
        );
        return Math.max(fromY, toY);
    };

    // Table columns
    const col = {
        no: { x: left, w: 20 },
        qty: { w: 66 },
        price: { w: 68 },
        tax: { w: 40 },
        amt: { w: 78 },
    };
    col.amt.x = right - col.amt.w;
    col.tax.x = col.amt.x - col.tax.w;
    col.price.x = col.tax.x - col.price.w;
    col.qty.x = col.price.x - col.qty.w;
    col.item = { x: left + col.no.w, w: col.qty.x - (left + col.no.w) - 8 };

    const drawTableHead = (y) => {
        hRule(y);
        const ty = y + 10;
        line("Item", col.item.x, ty, col.item.w, { size: 8, color: C.muted });
        line("Qty", col.qty.x, ty, col.qty.w, { size: 8, color: C.muted, align: "right" });
        line("Price", col.price.x, ty, col.price.w, { size: 8, color: C.muted, align: "right" });
        line("Tax", col.tax.x, ty, col.tax.w, { size: 8, color: C.muted, align: "right" });
        line("Amount", col.amt.x, ty, col.amt.w, { size: 8, color: C.muted, align: "right" });
        hRule(y + 28);
        return y + 28;
    };

    const rowMetrics = (it) => {
        const name = it.productName || it.name || it.itemName || "Item";
        const desc = it.description || "";
        const nh = heightOf(name, col.item.w, 9.5, true, 0);
        const dh = desc ? heightOf(desc, col.item.w, 8, false, 0) + 2 : 0;
        return { name, desc, nh, dh, h: Math.max(38, 24 + nh + dh) };
    };

    const drawRow = (it, i, y, m) => {
        const qty = num(it.quantity);
        const price = num(it.price);
        const rate = num(it.taxRate ?? it.tax);
        const amount = it.lineTotal != null ? num(it.lineTotal) : qty * price;
        const ry = y + 13;
        line(i + 1, col.no.x, ry, col.no.w, { size: 8.5, color: C.muted });
        block(m.name, col.item.x, ry, col.item.w, { bold: true, size: 9.5, color: C.ink, lineGap: 0 });
        if (m.desc) block(m.desc, col.item.x, ry + m.nh + 2, col.item.w, { size: 8, color: C.muted, lineGap: 0 });
        line(`${qty}${it.unit ? ` ${it.unit}` : ""}`, col.qty.x, ry, col.qty.w, { size: 9, color: C.ink, align: "right" });
        line(money(price), col.price.x, ry, col.price.w, { size: 9, color: C.ink, align: "right" });
        line(`${rate}%`, col.tax.x, ry, col.tax.w, { size: 9, color: C.ink, align: "right" });
        line(money(amount), col.amt.x, ry, col.amt.w, { bold: true, size: 9.5, color: C.ink, align: "right" });
        hRule(y + m.h, left, right, C.rule, 0.5);
    };

    const drawTotals = (y) => {
        const subTotal = invoice.subTotal ?? items.reduce((s, it) => s + num(it.quantity) * num(it.price), 0);
        const discount = num(invoice.totalDiscount);
        const tax = num(invoice.totalTax);
        const grand = invoice.grandTotal ?? num(subTotal) - discount + tax;

        const w = 230;
        const x = right - w;
        let cy = y;
        const row = (label, value) => {
            line(label, x, cy, w / 2, { size: 9.5, color: C.ink });
            line(value, x + w / 2, cy, w / 2, { bold: true, size: 9.5, color: C.ink, align: "right" });
            cy += 15;
            hRule(cy - 5, x, right, C.rule, 0.5);
            cy += 4;
        };
        row("Subtotal", money(subTotal));
        if (discount > 0) row("Discount", `−${money(discount)}`);
        row("Tax", money(tax));
        // double rule, like the app
        hRule(cy - 2, x, right, C.ink, 0.9);
        hRule(cy + 1, x, right, C.ink, 0.9);
        cy += 10;
        line("Total", x, cy, w / 2, { bold: true, size: 14, color: C.ink });
        line(money(grand), x + w / 2, cy, w / 2, { bold: true, size: 14, color: C.ink, align: "right" });
        return cy + 28;
    };

    const totalsHeight = 30 + 19 * (2 + (num(invoice.totalDiscount) > 0 ? 1 : 0)) + 40;

    const drawFooterNotes = (startY) => {
        let y = startY;
        const need = (h) => {
            if (y + h > bottom) y = nextPage();
        };
        need(30);
        dots(y);
        y += 16;
        if (invoice.paymentMethod) {
            setFont(true, 9, C.ink);
            const label = "Payment method: ";
            const lw = doc.widthOfString(label);
            line(label, left, y, lw + 4, { bold: true, size: 9, color: C.ink });
            line(invoice.paymentMethod, left + lw, y, contentW - lw, { size: 9, color: C.muted });
            y += 20;
        }
        [
            ["Notes", invoice.notes],
            ["Terms and conditions", invoice.termsAndConditions],
        ].forEach(([title, text]) => {
            if (!text) return;
            const h = heightOf(text, contentW, 8.5, false, 1.5);
            need(16 + Math.min(h, 60));
            line(title, left, y, contentW, { bold: true, size: 9, color: C.ink });
            y += 14;
            // a very long block may span pages: print it paragraph by paragraph
            String(text).split("\n").forEach((para) => {
                const ph = heightOf(para || " ", contentW, 8.5, false, 1.5);
                need(ph);
                block(para || " ", left, y, contentW, { size: 8.5, color: C.muted, lineGap: 1.5 });
                y += ph + 2;
            });
            y += 8;
        });
    };

    // ---------- Execute ----------
    doc.registerFont("Regular", FONT_REGULAR);
    doc.registerFont("Bold", FONT_BOLD);
    doc.info.Title = `Invoice ${invoice.invoiceNumber || ""}`.trim();
    doc.info.Author = biz.businessName || "InvoicePilot";

    // Layout is fully manual: no automatic margins, so PDFKit never adds stray pages.
    doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };
    paintPage();

    let y = drawHeader(top);
    y = drawMeta(y + 8);
    y = drawParties(y + 22) + 22;

    y = drawTableHead(y);
    items.forEach((it, i) => {
        const m = rowMetrics(it);
        if (y + m.h > bottom) {
            y = drawTableHead(nextPage());
        }
        drawRow(it, i, y, m);
        y += m.h;
    });

    y += 14;
    if (y + totalsHeight > bottom) y = nextPage();
    y = drawTotals(y);
    drawFooterNotes(y);

    // Page footer: invoice number + "Page x of y" (only when there is more than one page)
    const range = doc.bufferedPageRange();
    if (range.count > 1) {
        for (let i = 0; i < range.count; i += 1) {
            doc.switchToPage(range.start + i);
            const fy = H - OUTER - PAD + 6;
            line(invoice.invoiceNumber || "", left, fy, contentW / 2, { size: 7.5, color: C.muted });
            line(`Page ${i + 1} of ${range.count}`, left + contentW / 2, fy, contentW / 2, { size: 7.5, color: C.muted, align: "right" });
        }
    }
};

export default generateInvoiceTemplate;
