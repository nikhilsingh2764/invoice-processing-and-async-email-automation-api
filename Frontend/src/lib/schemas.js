import { z } from 'zod';
import { CURRENCIES, CUSTOMER_TYPES, INDIAN_STATES, INVOICE_STATUSES, PAYMENT_METHODS, PRODUCT_UNITS } from './constants';

// ---- Shared rules (mirror the backend express-validator chains) ----
const PHONE = /^[0-9]{10}$/;
const GST = /^[0-9A-Za-z]{15}$/;
const POSTAL = /^[1-9][0-9]{5}$/;

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

export const passwordRules = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must have at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[@$!%*?&]/, 'Password must contain a special character (@ $ ! % * ? &)');

const username = z
  .string()
  .trim()
  .min(1, 'Username is required')
  .min(3, 'Username must be 3–30 characters')
  .max(30, 'Username must be 3–30 characters')
  .regex(/^[A-Za-z0-9_]+$/, 'Only letters, numbers and underscores');

const otp = z.string().trim().regex(/^[0-9]{6}$/, 'Enter the 6-digit code');

/** Optional text that, when filled, must be within [min, max] characters (empty strings are omitted from requests). */
const optionalText = (min, max, label) =>
  z.string().trim().refine((v) => v === '' || (v.length >= min && v.length <= max), `${label} must be ${min}–${max} characters`);
const optionalPattern = (re, message) => z.string().trim().refine((v) => v === '' || re.test(v), message);

const withConfirm = (schema, passwordField) =>
  schema.refine((d) => d.confirmPassword === d[passwordField], { path: ['confirmPassword'], message: 'Passwords do not match' });

// ---- Auth ----
export const loginSchema = z.object({ email, password: passwordRules });
export const signupSchema = withConfirm(z.object({ username, email, password: passwordRules, confirmPassword: z.string().min(1, 'Confirm your password') }), 'password');
export const otpSchema = z.object({ email, otp });
export const forgotSchema = z.object({ email });
export const resetSchema = withConfirm(z.object({ email, otp, newPassword: passwordRules, confirmPassword: z.string().min(1, 'Confirm your password') }), 'newPassword');

// ---- Profile ----
export const usernameSchema = z.object({ username });
export const changePasswordSchema = withConfirm(
  z.object({ oldPassword: z.string().min(1, 'Current password is required'), newPassword: passwordRules, confirmPassword: z.string().min(1, 'Confirm your new password') }),
  'newPassword',
).refine((d) => d.oldPassword !== d.newPassword, { path: ['newPassword'], message: 'New password must differ from the current one' });

// ---- Address ----
const requiredText = (label) => z.string().trim().min(1, `${label} is required`);
export const addressSchema = z.object({
  addressLine1: requiredText('Address'),
  addressLine2: z.string().trim(),
  city: requiredText('City'),
  state: z.enum(INDIAN_STATES, { message: 'Select a state' }),
  country: z.literal('India'),
  postalCode: z.string().trim().regex(POSTAL, 'Enter a valid 6-digit PIN code'),
});
export const emptyAddress = { addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '' };

// ---- Customer ----
export const customerSchema = z.object({
  customerName: z.string().trim().min(1, 'Name is required').min(3, 'Name must be 3–100 characters').max(100, 'Name must be 3–100 characters'),
  email,
  phone: z.string().trim().regex(PHONE, 'Phone must be exactly 10 digits'),
  companyName: optionalText(3, 100, 'Company name'),
  gstNumber: optionalPattern(GST, 'GST number must be exactly 15 letters/digits'),
  customerType: z.enum(CUSTOMER_TYPES),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters'),
  billingAddress: addressSchema,
  shippingDifferent: z.boolean(),
  shippingAddress: z.object({
    addressLine1: z.string(), addressLine2: z.string(), city: z.string(), state: z.string(), country: z.string(), postalCode: z.string(),
  }),
}).superRefine((d, ctx) => {
  if (!d.shippingDifferent) return;
  const res = addressSchema.safeParse(d.shippingAddress);
  if (!res.success) {
    for (const issue of res.error.issues) ctx.addIssue({ code: 'custom', path: ['shippingAddress', ...issue.path], message: issue.message });
  }
});

// ---- Product ----
const percent = (label) => z.number({ message: `${label} must be a number` }).min(0, `${label} must be 0–100`).max(100, `${label} must be 0–100`);
export const productSchema = z.object({
  productName: z.string().trim().min(1, 'Product name is required').min(3, 'Name must be 3–100 characters').max(100, 'Name must be 3–100 characters'),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters'),
  category: requiredText('Category'),
  unit: z.enum(PRODUCT_UNITS, { message: 'Select a unit' }),
  price: z.number({ message: 'Enter a price' }).min(0, 'Price cannot be negative'),
  taxRate: percent('Tax rate'),
  discount: percent('Discount'),
});

// ---- Business ----
export const businessSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required').min(3, 'Must be 3–100 characters').max(100, 'Must be 3–100 characters'),
  ownerName: z.string().trim().min(1, 'Owner name is required').min(3, 'Must be 3–100 characters').max(100, 'Must be 3–100 characters'),
  email,
  phone: z.string().trim().regex(PHONE, 'Phone must be exactly 10 digits'),
  gstNumber: optionalPattern(GST, 'GST number must be exactly 15 letters/digits'),
  address: addressSchema,
  currency: z.enum(CURRENCIES, { message: 'Select a currency' }),
  invoicePrefix: z.string().trim().min(2, 'Prefix must be 2–10 characters').max(10, 'Prefix must be 2–10 characters'),
  invoiceStartNumber: z.number({ message: 'Enter a number' }).int('Whole numbers only').min(1, 'Must be at least 1'),
  logo: z.string().trim(),
  signature: z.string().trim(),
  termsAndConditions: z.string().trim().max(1000, 'Cannot exceed 1000 characters'),
});

// ---- Invoice ----
export const invoiceSchema = z.object({
  customerId: z.string(),
  items: z
    .array(z.object({
      productId: z.string().min(1, 'Select a product'),
      quantity: z.number({ message: 'Enter a quantity' }).int('Whole numbers only').min(1, 'Minimum quantity is 1'),
    }))
    .min(1, 'Add at least one item'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(INVOICE_STATUSES),
  paymentMethod: z.union([z.enum(PAYMENT_METHODS), z.literal('')]),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters'),
  termsAndConditions: z.string().trim().max(2000, 'Terms cannot exceed 2000 characters'),
});

/** Creating requires a customer; when editing, an empty selection means "keep the current customer". */
export const makeInvoiceSchema = (isEdit) =>
  invoiceSchema.refine((d) => isEdit || d.customerId.length > 0, { path: ['customerId'], message: 'Select a customer' });
