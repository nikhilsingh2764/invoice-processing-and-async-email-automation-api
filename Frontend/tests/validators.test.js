import { describe, expect, it } from 'vitest'
import { businessSchema, customerSchema, deleteAccountSchema, invoiceSchema, loginSchema, productSchema, resetSchema, signupSchema } from '../src/lib/validators.js'

const address = { addressLine1: '12 MG Road', city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411001' }

describe('auth schemas', () => {
  it('login lower-cases and trims the email', () => {
    const r = loginSchema.parse({ email: '  A@B.CO ', password: 'x' })
    expect(r.email).toBe('a@b.co')
  })
  it('signup needs consent, a valid username and a strong password', () => {
    const base = { username: 'nikhil_s', email: 'n@x.co', password: 'Str0ng!Pass', acceptTerms: true }
    expect(signupSchema.safeParse(base).success).toBe(true)
    expect(signupSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false)
    expect(signupSchema.safeParse({ ...base, username: 'a b' }).success).toBe(false)
    expect(signupSchema.safeParse({ ...base, username: 'ab' }).success).toBe(false)
    expect(signupSchema.safeParse({ ...base, password: 'weak' }).success).toBe(false)
    expect(signupSchema.safeParse({ ...base, password: 'Nikhil_s@123' }).success).toBe(false) // contains username
  })
  it('reset checks the 6-digit code and matching passwords', () => {
    const base = { email: 'n@x.co', otp: '123456', newPassword: 'Str0ng!Pass', confirmPassword: 'Str0ng!Pass' }
    expect(resetSchema.safeParse(base).success).toBe(true)
    expect(resetSchema.safeParse({ ...base, otp: '12345' }).success).toBe(false)
    expect(resetSchema.safeParse({ ...base, confirmPassword: 'other' }).success).toBe(false)
  })
  it('delete account needs the literal word DELETE', () => {
    expect(deleteAccountSchema.safeParse({ password: 'x', confirmText: 'delete' }).success).toBe(false)
    expect(deleteAccountSchema.safeParse({ password: 'x', confirmText: 'DELETE' }).success).toBe(true)
  })
})

describe('business, customer, product', () => {
  const business = { businessName: 'Studio X', ownerName: 'Owner', email: 'o@x.co', phone: '9876543210', address, currency: 'INR', invoicePrefix: 'INV', invoiceStartNumber: '1', termsAndConditions: '' }
  it('business accepts valid data and coerces the start number', () => {
    const r = businessSchema.parse(business)
    expect(r.invoiceStartNumber).toBe(1)
  })
  it('business rejects bad phone, GST and postal code', () => {
    expect(businessSchema.safeParse({ ...business, phone: '12345' }).success).toBe(false)
    expect(businessSchema.safeParse({ ...business, gstNumber: 'SHORT' }).success).toBe(false)
    expect(businessSchema.safeParse({ ...business, address: { ...address, postalCode: '011001' } }).success).toBe(false)
  })
  it('business refuses an unsafe logo link', () => {
    expect(businessSchema.safeParse({ ...business, logo: 'javascript:alert(1)' }).success).toBe(false)
    expect(businessSchema.safeParse({ ...business, logo: 'https://cdn.example.com/l.png' }).success).toBe(true)
  })
  const customer = { customerName: 'Acme Ltd', email: 'a@acme.co', phone: '9999999999', customerType: 'Business', billingAddress: address, shippingSame: true }
  it('customer: shipping optional when same, required otherwise', () => {
    expect(customerSchema.safeParse(customer).success).toBe(true)
    expect(customerSchema.safeParse({ ...customer, shippingSame: false }).success).toBe(false)
    expect(customerSchema.safeParse({ ...customer, shippingSame: false, shippingAddress: address }).success).toBe(true)
  })
  it('product: price, tax and discount ranges', () => {
    const p = { productName: 'Logo design', description: 'd', category: 'Design', unit: 'service', price: '100', taxRate: '18', discount: '' }
    expect(productSchema.parse(p).discount).toBe(0)
    expect(productSchema.safeParse({ ...p, price: '-1' }).success).toBe(false)
    expect(productSchema.safeParse({ ...p, taxRate: '101' }).success).toBe(false)
  })
})

describe('invoice schema', () => {
  const inv = { customerId: 'c1', items: [{ productId: 'p1', quantity: '2' }], dueDate: '2026-12-01', status: 'Pending' }
  it('coerces quantities and accepts a valid invoice', () => expect(invoiceSchema.parse(inv).items[0].quantity).toBe(2))
  it('rejects empty items, zero quantity and duplicate products', () => {
    expect(invoiceSchema.safeParse({ ...inv, items: [] }).success).toBe(false)
    expect(invoiceSchema.safeParse({ ...inv, items: [{ productId: 'p1', quantity: '0' }] }).success).toBe(false)
    expect(invoiceSchema.safeParse({ ...inv, items: [{ productId: 'p1', quantity: 1 }, { productId: 'p1', quantity: 1 }] }).success).toBe(false)
  })
})
