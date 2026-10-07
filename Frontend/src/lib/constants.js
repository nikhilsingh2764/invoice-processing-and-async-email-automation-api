// Values mirror the backend validators / Mongoose enums exactly.
export const INVOICE_STATUSES = ['Draft', 'Pending', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled'];
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cheque'];
export const PRODUCT_UNITS = ['piece', 'kg', 'gram', 'liter', 'meter', 'hour', 'service'];
export const CUSTOMER_TYPES = ['Individual', 'Business'];
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'INR', 'CHF', 'CAD', 'AUD', 'CNY', 'RUB', 'BRL',
  'ZAR', 'MXN', 'SGD', 'SEK', 'KRW', 'HKD', 'NZD', 'TRY', 'IDR', 'ILS',
];
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];
// Fields the dashboard endpoint accepts for `sortBy`.
export const INVOICE_SORT_FIELDS = [
  { value: 'createdAt', label: 'Created' },
  { value: 'invoiceDate', label: 'Invoice date' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'grandTotal', label: 'Amount' },
  { value: 'invoiceNumber', label: 'Number' },
  { value: 'status', label: 'Status' },
];
export const PAGE_SIZES = [10, 25, 50, 100];
// The backend caches dashboard / invoice-list responses for 10 minutes.
export const DASHBOARD_CACHE_MINUTES = 10;
