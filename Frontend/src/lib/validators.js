// zod schemas that mirror the backend validators (Backend/src/validators/*) exactly.
import { z } from 'zod'
import { COUNTRIES, CURRENCIES, CUSTOMER_TYPES, INVOICE_STATUSES, PAYMENT_METHODS, STATES, UNITS } from '../config/enums.js'
import { passwordAdvice } from './password.js'
import { safeUrl } from './security.js'

export const RX = {
  phone: /^[0-9]{10}$/,
  gst: /^[0-9A-Za-z]{15}$/,
  postal: /^[1-9][0-9]{5}$/,
  username: /^[A-Za-z0-9_]+$/,
  otp: /^[0-9]{6}$/,
}

const trimmed = (message) => z.string({ required_error: message, invalid_type_error: message }).trim()
const optionalText = (max, message) =>
  z.string().trim().max(max, message).optional().transform((v) => (v ? v : undefined))

export const emailSchema = trimmed('Enter your email').min(1, 'Enter your email').email('Enter a valid email address').transform((v) => v.toLowerCase())

export const passwordSchema = z
  .string({ required_error: 'Enter a password' })
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Z]/, 'Add one uppercase letter')
  .regex(/[a-z]/, 'Add one lowercase letter')
  .regex(/[0-9]/, 'Add one number')
  .regex(/[@$!%*?&]/, 'Add one of @ $ ! % * ? &')

export const usernameSchema = trimmed('Choose a username')
  .min(3, 'Use 3 to 30 characters')
  .max(30, 'Use 3 to 30 characters')
  .regex(RX.username, 'Use only letters, numbers and underscores')

export const otpSchema = trimmed('Enter the 6-digit code').regex(RX.otp, 'Enter the 6-digit code')

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Enter your password') })

export const signupSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Agree to the Terms and the Privacy Policy to continue' }) }),
  })
  .superRefine((v, ctx) => {
    const advice = passwordAdvice(v.password, { username: v.username, email: v.email })
    if (advice) ctx.addIssue({ code: 'custom', path: ['password'], message: advice })
  })

export const forgotSchema = z.object({ email: emailSchema })

export const resetSchema = z
  .object({ email: emailSchema, otp: otpSchema, newPassword: passwordSchema, confirmPassword: z.string().min(1, 'Confirm your new password') })
  .superRefine((v, ctx) => {
    if (v.newPassword !== v.confirmPassword) ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' })
    const advice = passwordAdvice(v.newPassword, { email: v.email })
    if (advice) ctx.addIssue({ code: 'custom', path: ['newPassword'], message: advice })
  })

export const profileSchema = z.object({ username: usernameSchema })

export const changePasswordSchema = z
  .object({ oldPassword: z.string().min(1, 'Enter your current password'), newPassword: passwordSchema, confirmPassword: z.string().min(1, 'Confirm your new password') })
  .superRefine((v, ctx) => {
    if (v.newPassword !== v.confirmPassword) ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' })
    if (v.newPassword && v.newPassword === v.oldPassword) ctx.addIssue({ code: 'custom', path: ['newPassword'], message: 'Choose a password you have not used here' })
    const advice = passwordAdvice(v.newPassword)
    if (advice) ctx.addIssue({ code: 'custom', path: ['newPassword'], message: advice })
  })

export const addressSchema = z.object({
  addressLine1: trimmed('Enter the address').min(1, 'Enter the address'),
  addressLine2: optionalText(200),
  city: trimmed('Enter the city').min(1, 'Enter the city'),
  state: z.enum(STATES, { errorMap: () => ({ message: 'Choose a state' }) }),
  country: z.enum(COUNTRIES, { errorMap: () => ({ message: 'Choose a country' }) }),
  postalCode: trimmed('Enter the postal code').regex(RX.postal, 'Enter a 6-digit postal code that does not start with 0'),
})

const phone = trimmed('Enter a phone number').regex(RX.phone, 'Enter exactly 10 digits')
const gstOptional = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || RX.gst.test(v), 'GST number must be exactly 15 letters or digits')
  .transform((v) => (v ? v : undefined))

const intFromInput = (min, message) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number({ required_error: message, invalid_type_error: message }).int(message).min(min, message),
  )

const numberInRange = (min, max, message, fallback) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? fallback : Number(v)),
    z.number({ required_error: message, invalid_type_error: message }).min(min, message).max(max, message),
  )

// The server accepts decimal quantities (0.5 kg, 1.5 hours) from 0.01 upwards.
const quantityField = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number({ required_error: 'Enter a quantity', invalid_type_error: 'Enter a quantity' }).min(0.01, 'Quantity must be at least 0.01').max(1000000, 'Quantity is too large'),
)

export const businessSchema = z.object({
  businessName: trimmed('Enter the business name').min(3, 'Use 3 to 100 characters').max(100, 'Use 3 to 100 characters'),
  ownerName: trimmed('Enter the owner name').min(3, 'Use 3 to 100 characters').max(100, 'Use 3 to 100 characters'),
  email: emailSchema,
  phone,
  gstNumber: gstOptional,
  address: addressSchema,
  currency: z.enum(CURRENCIES, { errorMap: () => ({ message: 'Choose a currency' }) }),
  logo: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || safeUrl(v) !== null, 'Use a secure https:// link to an image')
    .transform((v) => (v ? v : undefined)),
  signature: optionalText(500),
  invoicePrefix: trimmed('Enter a prefix').min(2, 'Use 2 to 10 characters').max(10, 'Use 2 to 10 characters'),
  invoiceStartNumber: intFromInput(1, 'Enter a whole number, 1 or more'),
  termsAndConditions: z.string().trim().max(1000, 'Keep terms within 1000 characters').optional().transform((v) => v ?? ''),
})

export const customerSchema = z
  .object({
    customerName: trimmed('Enter the customer name').min(3, 'Use 3 to 100 characters').max(100, 'Use 3 to 100 characters'),
    email: emailSchema,
    phone,
    companyName: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || (v.length >= 3 && v.length <= 100), 'Use 3 to 100 characters')
      .transform((v) => (v ? v : undefined)),
    gstNumber: gstOptional,
    customerType: z.enum(CUSTOMER_TYPES, { errorMap: () => ({ message: 'Choose a customer type' }) }),
    notes: optionalText(500, 'Keep notes within 500 characters'),
    billingAddress: addressSchema,
    shippingSame: z.boolean().default(true),
    shippingAddress: addressSchema.optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.shippingSame && !v.shippingAddress) ctx.addIssue({ code: 'custom', path: ['shippingAddress', 'addressLine1'], message: 'Enter the shipping address' })
  })

export const productSchema = z.object({
  productName: trimmed('Enter the product name').min(3, 'Use 3 to 100 characters').max(100, 'Use 3 to 100 characters'),
  description: trimmed('Enter a description').min(1, 'Enter a description').max(500, 'Keep it within 500 characters'),
  category: trimmed('Enter a category').min(1, 'Enter a category'),
  unit: z.enum(UNITS, { errorMap: () => ({ message: 'Choose a unit' }) }),
  price: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number({ required_error: 'Enter a price', invalid_type_error: 'Enter a price' }).min(0, 'Price cannot be negative'),
  ),
  taxRate: numberInRange(0, 100, 'Use 0 to 100', 0),
  discount: numberInRange(0, 100, 'Use 0 to 100', 0),
})

export const invoiceSchema = z
  .object({
    customerId: trimmed('Choose a customer').min(1, 'Choose a customer'),
    items: z
      .array(z.object({ productId: trimmed('Choose a product').min(1, 'Choose a product'), quantity: quantityField }))
      .min(1, 'Add at least one item'),
    dueDate: trimmed('Choose a due date').min(1, 'Choose a due date'),
    status: z.enum(INVOICE_STATUSES).default('Pending'),
    paymentMethod: z
      .string()
      .optional()
      .refine((v) => !v || PAYMENT_METHODS.includes(v), 'Choose a payment method')
      .transform((v) => (v ? v : undefined)),
    notes: optionalText(1000, 'Keep notes within 1000 characters'),
    termsAndConditions: z.string().trim().max(1000, 'Keep terms within 1000 characters').optional(),
  })
  .superRefine((v, ctx) => {
    const seen = new Set()
    v.items.forEach((item, i) => {
      if (item.productId && seen.has(item.productId)) ctx.addIssue({ code: 'custom', path: ['items', i, 'productId'], message: 'Each product can appear once' })
      seen.add(item.productId)
    })
  })

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Enter your password'),
  confirmText: z.literal('DELETE', { errorMap: () => ({ message: 'Type DELETE to confirm' }) }),
})
