// ==========================
// Invoice statuses (must match Backend/src/model/invoice/invoice.model.js)
// ==========================
export const INVOICE_STATUSES = [
    "Draft",
    "Pending",
    "Paid",
    "Partially Paid",
    "Overdue",
    "Cancelled",
];

export const INVOICE_STATUS_STYLES = {
    Draft: "bg-slate-100 text-slate-600 border-slate-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Partially Paid": "bg-sky-50 text-sky-700 border-sky-200",
    Overdue: "bg-red-50 text-red-700 border-red-200",
    Cancelled: "bg-slate-100 text-slate-500 border-slate-200 line-through",
};

// ==========================
// Payment methods (Backend/src/model/invoice/invoice.model.js)
// ==========================
export const PAYMENT_METHODS = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Cheque",
];

// ==========================
// Product units (Backend/src/model/invoice/product.model.js)
// ==========================
export const PRODUCT_UNITS = [
    "piece",
    "kg",
    "gram",
    "liter",
    "meter",
    "hour",
    "service",
];

// ==========================
// Customer types (Backend/src/validators/customer.validator.js)
// ==========================
export const CUSTOMER_TYPES = ["Individual", "Business"];

// ==========================
// Currencies (Backend/src/model/invoice/Business.model.js)
// ==========================
export const CURRENCIES = [
    "USD", "EUR", "GBP", "JPY", "INR", "CHF", "CAD", "AUD", "CNY", "RUB",
    "BRL", "ZAR", "MXN", "SGD", "SEK", "KRW", "HKD", "NZD", "TRY", "IDR", "ILS",
];

// Symbols used only for display formatting on the frontend.
export const CURRENCY_SYMBOLS = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", INR: "₹", CHF: "CHF",
    CAD: "CA$", AUD: "A$", CNY: "¥", RUB: "₽", BRL: "R$", ZAR: "R",
    MXN: "MX$", SGD: "S$", SEK: "kr", KRW: "₩", HKD: "HK$", NZD: "NZ$",
    TRY: "₺", IDR: "Rp", ILS: "₪",
};

// ==========================
// Indian states (Backend/src/model/invoice/address.model.js — the only
// states/country the backend currently accepts for any address).
// ==========================
export const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal",
];

export const COUNTRIES = ["India"];

export const EMPTY_ADDRESS = {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
};
