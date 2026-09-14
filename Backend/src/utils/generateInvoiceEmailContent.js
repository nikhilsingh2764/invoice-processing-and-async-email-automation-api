// =====================================================
// Invoice email (HTML) - table based + inline styles so it
// renders correctly in Gmail, Outlook, Apple Mail and mobile.
// =====================================================

const esc = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const formatMoney = (amount, currency = "INR") => {
    try {
        return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(toNumber(amount));
    } catch {
        return `${currency} ${toNumber(amount).toFixed(2)}`;
    }
};

const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata"
    });
};

const STATUS_STYLES = {
    PAID: { bg: "#ECFDF5", fg: "#047857" },
    PENDING: { bg: "#FFFBEB", fg: "#B45309" },
    "PARTIALLY PAID": { bg: "#EFF6FF", fg: "#1D4ED8" },
    OVERDUE: { bg: "#FEF2F2", fg: "#B91C1C" },
    CANCELLED: { bg: "#F1F5F9", fg: "#475569" },
    DRAFT: { bg: "#F1F5F9", fg: "#475569" }
};

const MAX_ITEMS_SHOWN = 5;

const generateInvoiceEmailContent = (invoice) => {
    const business = invoice.business || {};
    const customer = invoice.customer || {};

    const businessName = business.businessName || "Our Team";
    const customerName = customer.customerName || customer.name || "Customer";
    const currency = business.currency || "INR";
    const invoiceNumber = invoice.invoiceNumber || "";

    // Logo only if it is a public https URL (email clients cannot load local paths)
    const logoUrl = /^https:\/\//i.test(String(business.logo || "")) ? business.logo : "";

    const status = String(invoice.status || "Pending");
    const statusKey = status.toUpperCase();
    const st = STATUS_STYLES[statusKey] || STATUS_STYLES.PENDING;
    const isPaid = statusKey === "PAID";
    const isCancelled = statusKey === "CANCELLED";

    const grandTotal = formatMoney(invoice.grandTotal, currency);
    const dueDate = formatDate(invoice.dueDate);

    const subject = isPaid
        ? `Payment receipt: Invoice ${invoiceNumber} from ${businessName}`
        : `Invoice ${invoiceNumber} from ${businessName} - ${grandTotal} due ${dueDate}`;

    const preheader = isPaid
        ? `Thank you! Invoice ${invoiceNumber} is paid. Your PDF copy is attached.`
        : `Invoice ${invoiceNumber} for ${grandTotal} is due on ${dueDate}. PDF attached.`;

    // ---------- headline text ----------
    const intro = isPaid
        ? `Thank you for your payment. Your invoice is marked as paid, and a copy is attached for your records.`
        : `Thank you for your business. Your invoice from <strong>${esc(businessName)}</strong> is ready. The full invoice is attached to this email as a PDF.`;

    const amountLabel = isPaid ? "Amount paid" : "Amount due";

    // ---------- details rows ----------
    const detailRow = (label, value, bold = false) => `
        <tr>
            <td style="padding:8px 0;font-size:14px;color:#64748B;border-bottom:1px solid #E2E8F0;">${esc(label)}</td>
            <td align="right" style="padding:8px 0;font-size:14px;color:#0F172A;${bold ? "font-weight:bold;" : ""}border-bottom:1px solid #E2E8F0;">${value}</td>
        </tr>`;

    const detailsRows = [
        detailRow("Invoice number", esc(invoiceNumber), true),
        detailRow("Invoice date", esc(formatDate(invoice.invoiceDate))),
        detailRow("Due date", esc(dueDate), !isPaid),
        invoice.paymentMethod ? detailRow("Payment method", esc(invoice.paymentMethod)) : ""
    ].join("");

    // ---------- items ----------
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const shown = items.slice(0, MAX_ITEMS_SHOWN);
    const hidden = items.length - shown.length;

    const itemRows = shown
        .map((it) => {
            const name = it.productName || it.name || it.itemName || "Item";
            const qty = toNumber(it.quantity);
            const lineTotal =
                it.lineTotal !== undefined && it.lineTotal !== null
                    ? it.lineTotal
                    : qty * toNumber(it.price);
            return `
            <tr>
                <td style="padding:8px 0;font-size:14px;color:#0F172A;border-bottom:1px solid #E2E8F0;">
                    ${esc(name)}
                    <span style="color:#94A3B8;font-size:12px;"> &times; ${esc(qty)}</span>
                </td>
                <td align="right" style="padding:8px 0;font-size:14px;color:#0F172A;border-bottom:1px solid #E2E8F0;">
                    ${esc(formatMoney(lineTotal, currency))}
                </td>
            </tr>`;
        })
        .join("");

    const itemsBlock = items.length
        ? `
        <tr><td style="padding:24px 32px 0 32px;">
            <div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:#1D4ED8;text-transform:uppercase;padding-bottom:6px;">Items</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${itemRows}
                ${hidden > 0 ? `<tr><td colspan="2" style="padding:8px 0;font-size:12px;color:#64748B;">+ ${hidden} more item(s) in the attached PDF</td></tr>` : ""}
            </table>
        </td></tr>`
        : "";

    // ---------- totals ----------
    const totalRow = (label, value) => `
        <tr>
            <td style="padding:5px 0;font-size:14px;color:#64748B;">${esc(label)}</td>
            <td align="right" style="padding:5px 0;font-size:14px;color:#0F172A;">${esc(value)}</td>
        </tr>`;

    const totalsBlock = `
        <tr><td style="padding:16px 32px 0 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${totalRow("Subtotal", formatMoney(invoice.subTotal, currency))}
                ${toNumber(invoice.totalDiscount) > 0 ? totalRow("Discount", `- ${formatMoney(invoice.totalDiscount, currency)}`) : ""}
                ${totalRow("Tax", formatMoney(invoice.totalTax, currency))}
                <tr>
                    <td style="padding:10px 0 0 0;font-size:15px;font-weight:bold;color:#0F172A;border-top:2px solid #0F172A;">Total</td>
                    <td align="right" style="padding:10px 0 0 0;font-size:15px;font-weight:bold;color:#0F172A;border-top:2px solid #0F172A;">${esc(grandTotal)}</td>
                </tr>
            </table>
        </td></tr>`;

    // ---------- notes ----------
    const notesBlock = invoice.notes
        ? `
        <tr><td style="padding:24px 32px 0 32px;">
            <div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:#1D4ED8;text-transform:uppercase;padding-bottom:6px;">Note</div>
            <div style="font-size:14px;color:#475569;line-height:1.6;">${esc(invoice.notes)}</div>
        </td></tr>`
        : "";

    // ---------- attachment hint ----------
    const attachBlock = `
        <tr><td style="padding:24px 32px 0 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;">
                <tr>
                    <td style="padding:14px 16px;font-size:14px;color:#0F172A;">
                        <strong>${esc(invoiceNumber)}.pdf</strong>
                        <span style="color:#64748B;"> &ndash; attached to this email</span>
                    </td>
                </tr>
            </table>
        </td></tr>`;

    // ---------- footer contact ----------
    const contactParts = [
        business.email ? `<a href="mailto:${esc(business.email)}" style="color:#1D4ED8;text-decoration:none;">${esc(business.email)}</a>` : "",
        business.phone ? esc(business.phone) : ""
    ].filter(Boolean);

    const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;">

    <!-- Preheader (inbox preview text) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F1F5F9;">${esc(preheader)}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;">
    <tr><td align="center" style="padding:24px 12px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">

            <!-- Brand header -->
            <tr><td style="background:#1D4ED8;padding:22px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    ${logoUrl ? `<td style="padding-right:12px;"><img src="${esc(logoUrl)}" alt="${esc(businessName)}" height="40" style="display:block;height:40px;max-width:120px;border-radius:6px;background:#FFFFFF;" /></td>` : ""}
                    <td>
                        <div style="font-size:20px;font-weight:bold;color:#FFFFFF;">${esc(businessName)}</div>
                        <div style="font-size:12px;color:#BFDBFE;padding-top:2px;">${isPaid ? "PAYMENT RECEIPT" : "INVOICE"}</div>
                    </td>
                </tr></table>
            </td></tr>

            <!-- Greeting -->
            <tr><td style="padding:28px 32px 0 32px;">
                <div style="font-size:16px;color:#0F172A;padding-bottom:8px;">Hello ${esc(customerName)},</div>
                <div style="font-size:14px;color:#475569;line-height:1.6;">${intro}</div>
            </td></tr>

            <!-- Amount card -->
            <tr><td style="padding:24px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFF6FF;border:1px solid #DBEAFE;border-radius:8px;">
                    <tr>
                        <td style="padding:18px 20px;">
                            <div style="font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:1px;">${amountLabel}</div>
                            <div style="font-size:28px;font-weight:bold;color:#0F172A;padding-top:4px;">${esc(grandTotal)}</div>
                            ${!isPaid && !isCancelled ? `<div style="font-size:13px;color:#475569;padding-top:4px;">Due by <strong>${esc(dueDate)}</strong></div>` : ""}
                        </td>
                        <td align="right" valign="top" style="padding:18px 20px;">
                            <span style="display:inline-block;padding:5px 12px;border-radius:999px;font-size:11px;font-weight:bold;letter-spacing:0.5px;background:${st.bg};color:${st.fg};border:1px solid ${st.fg};">${esc(statusKey)}</span>
                        </td>
                    </tr>
                </table>
            </td></tr>

            <!-- Details -->
            <tr><td style="padding:24px 32px 0 32px;">
                <div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:#1D4ED8;text-transform:uppercase;padding-bottom:2px;">Invoice details</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    ${detailsRows}
                </table>
            </td></tr>

            ${itemsBlock}
            ${totalsBlock}
            ${notesBlock}
            ${attachBlock}

            <!-- Help -->
            <tr><td style="padding:24px 32px 28px 32px;">
                <div style="font-size:14px;color:#475569;line-height:1.6;">
                    Questions about this invoice? Just reply to this email${contactParts.length ? ` or contact us at ${contactParts.join(" &middot; ")}` : ""}.
                </div>
                <div style="font-size:14px;color:#0F172A;padding-top:16px;">
                    Regards,<br/><strong>${esc(businessName)}</strong>
                </div>
            </td></tr>

            <!-- Footer -->
            <tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:16px 32px;text-align:center;font-size:11px;color:#94A3B8;line-height:1.5;">
                This email was sent by ${esc(businessName)} through Invoice App.<br/>
                Please keep the attached PDF for your records.
            </td></tr>

        </table>

    </td></tr>
    </table>
</body>
</html>`;

    return { subject, body };
};

export default generateInvoiceEmailContent;