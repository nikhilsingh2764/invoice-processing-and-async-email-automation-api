import { CURRENCY_SYMBOLS } from "./constants";

// ==========================
// Currency formatting
// ==========================
export const formatMoney = (amount, currency = "INR") => {

    const value = Number(amount) || 0;

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        // Unknown/unsupported currency code for Intl — fall back to a symbol prefix.
        const symbol = CURRENCY_SYMBOLS[currency] || "";
        return `${symbol}${value.toFixed(2)}`;
    }
};

// ==========================
// Date formatting
// ==========================
export const formatDate = (date) => {

    if (!date) return "—";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const formatDateInput = (date) => {

    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    return d.toISOString().slice(0, 10);
};

export const formatDateTime = (date) => {

    if (!date) return "—";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const isOverdue = (invoice) => {

    if (!invoice?.dueDate) return false;

    if (["Paid", "Cancelled"].includes(invoice.status)) return false;

    return new Date(invoice.dueDate).getTime() < Date.now();
};

// Extracts a human-readable error message from an axios error, matching
// the backend's ApiError / express-validator shapes.
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {

    const data = error?.response?.data;

    if (!data) return error?.message || fallback;

    if (Array.isArray(data.errors) && data.errors.length) {

        const first = data.errors[0];

        return first?.msg || first?.message || data.message || fallback;
    }

    return data.message || fallback;
};
