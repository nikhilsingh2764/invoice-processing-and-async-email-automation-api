// Enumerations that mirror the backend validators and models exactly.
export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]
export const COUNTRIES = ['India']
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'INR', 'CHF', 'CAD', 'AUD', 'CNY', 'RUB', 'BRL', 'ZAR', 'MXN', 'SGD', 'SEK',
  'KRW', 'HKD', 'NZD', 'TRY', 'IDR', 'ILS',
]
export const ZERO_DECIMAL_CURRENCIES = ['JPY', 'KRW', 'IDR']
export const INVOICE_STATUSES = ['Draft', 'Pending', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled']
export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cheque']
export const UNITS = ['piece', 'kg', 'gram', 'liter', 'meter', 'hour', 'service']
export const CUSTOMER_TYPES = ['Individual', 'Business']
export const SORT_FIELDS = ['createdAt', 'invoiceDate', 'dueDate', 'grandTotal', 'invoiceNumber', 'status']
export const SORT_ORDERS = ['asc', 'desc']
export const PAGE_SIZES = [10, 25, 50, 100]
