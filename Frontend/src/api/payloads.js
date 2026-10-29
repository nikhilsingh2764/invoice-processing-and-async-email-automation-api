// Payload whitelisting: every request body is built from known fields only (no mass assignment).
// Strings are trimmed, emails lower-cased and empty optional values become undefined.
const str = (v) => (typeof v === 'string' ? v.trim() : v)
const opt = (v) => {
  const s = str(v)
  return s === '' || s === null ? undefined : s
}
const email = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v)

export function compact(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v
  return out
}

const address = (a = {}) =>
  compact({ addressLine1: str(a.addressLine1), addressLine2: opt(a.addressLine2), city: str(a.city), state: str(a.state), country: str(a.country), postalCode: str(a.postalCode) })

export const buildSignup = (v) => ({ username: str(v.username), email: email(v.email), password: v.password })
export const buildLogin = (v) => ({ email: email(v.email), password: v.password })
export const buildVerifyOtp = (v) => ({ email: email(v.email), otp: str(v.otp) })
export const buildForgot = (v) => ({ email: email(v.email) })
export const buildReset = (v) => ({ email: email(v.email), otp: str(v.otp), newPassword: v.newPassword, confirmPassword: v.confirmPassword })
export const buildProfile = (v) => ({ username: str(v.username) })
export const buildChangePassword = (v) => ({ oldPassword: v.oldPassword, newPassword: v.newPassword })
export const buildDeleteAccount = (v) => ({ password: v.password })
export const buildGoogle = (idToken) => ({ idToken: String(idToken) })

export function buildBusiness(v) {
  return compact({
    businessName: str(v.businessName),
    ownerName: str(v.ownerName),
    email: email(v.email),
    phone: str(v.phone),
    gstNumber: opt(v.gstNumber),
    address: address(v.address),
    currency: v.currency,
    logo: opt(v.logo),
    signature: opt(v.signature),
    invoicePrefix: str(v.invoicePrefix),
    invoiceStartNumber: v.invoiceStartNumber === undefined ? undefined : Number(v.invoiceStartNumber),
    termsAndConditions: v.termsAndConditions === undefined ? undefined : str(v.termsAndConditions),
  })
}

export function buildCustomer(v, { update = false } = {}) {
  const same = v.shippingSame !== false
  return compact({
    customerName: str(v.customerName),
    email: email(v.email),
    phone: str(v.phone),
    companyName: opt(v.companyName),
    gstNumber: opt(v.gstNumber),
    customerType: v.customerType,
    notes: opt(v.notes),
    billingAddress: address(v.billingAddress),
    // On update, "same as billing" clears a previously saved shipping address (the server accepts null).
    shippingAddress: same || !v.shippingAddress ? (update ? null : undefined) : address(v.shippingAddress),
  })
}

export const buildProduct = (v) =>
  compact({
    productName: str(v.productName),
    description: str(v.description),
    category: str(v.category),
    unit: v.unit,
    price: Number(v.price),
    taxRate: v.taxRate === undefined ? undefined : Number(v.taxRate),
    discount: v.discount === undefined ? undefined : Number(v.discount),
  })

const items = (list = []) => list.map((i) => ({ productId: str(i.productId), quantity: Number(i.quantity) }))

export const buildInvoice = (v) =>
  compact({
    customerId: str(v.customerId),
    items: items(v.items),
    dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : undefined,
    status: v.status,
    paymentMethod: opt(v.paymentMethod),
    notes: opt(v.notes),
  })

/** PATCH body: only fields that differ from the original. */
export function buildInvoiceUpdate(next, original) {
  const full = buildInvoice(next)
  const out = {}
  if (full.customerId !== original.customerId) out.customerId = full.customerId
  const sameItems = JSON.stringify(full.items) === JSON.stringify(original.items.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })))
  if (!sameItems) out.items = full.items
  const originalDue = original.dueDate ? new Date(original.dueDate).toISOString().slice(0, 10) : ''
  if (next.dueDate && next.dueDate !== originalDue) out.dueDate = full.dueDate
  if (full.status !== original.status) out.status = full.status
  if ((full.paymentMethod || '') !== (original.paymentMethod || '')) out.paymentMethod = full.paymentMethod ?? original.paymentMethod
  if ((full.notes || '') !== (original.notes || '')) out.notes = full.notes ?? ''
  if (typeof next.termsAndConditions === 'string' && next.termsAndConditions.trim() !== (original.termsAndConditions || '').trim()) out.termsAndConditions = next.termsAndConditions.trim()
  return out
}
