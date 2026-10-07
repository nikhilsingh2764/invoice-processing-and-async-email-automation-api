import { describe, expect, it } from 'vitest';
import { normalizeError, shouldRetry } from '../src/lib/errors';
import { estimateTotals } from '../src/lib/invoiceMath';
import { stripEmpty } from '../src/lib/payload';
import { customerSchema, emptyAddress, loginSchema, makeInvoiceSchema, signupSchema } from '../src/lib/schemas';
import { isPastDue } from '../src/lib/format';

const http = (status, data) => ({ response: { status, data }, isAxiosError: true });

describe('normalizeError', () => {
  it('uses the backend message for 4xx', () => {
    expect(normalizeError(http(409, { success: false, message: 'Email already exists' }))).toMatchObject({ kind: 'conflict', message: 'Email already exists' });
  });
  it('hides 5xx details', () => {
    expect(normalizeError(http(500, { message: 'MongoServerError: stack…' })).message).not.toMatch(/Mongo/);
  });
  it('maps 429 and network errors', () => {
    expect(normalizeError(http(429, {})).kind).toBe('rateLimit');
    expect(normalizeError({ isAxiosError: true, code: 'ERR_NETWORK' }).kind).toBe('network');
    expect(normalizeError({ code: 'ECONNABORTED' }).kind).toBe('timeout');
  });
  it('extracts express-validator field errors when present', () => {
    expect(normalizeError(http(400, { message: 'x', errors: [{ path: 'email', msg: 'Bad' }] })).fieldErrors).toEqual({ email: 'Bad' });
  });
  it('retries only transient failures once and never 429', () => {
    expect(shouldRetry(0, http(500, {}))).toBe(true);
    expect(shouldRetry(1, http(500, {}))).toBe(false);
    expect(shouldRetry(0, http(429, {}))).toBe(false);
    expect(shouldRetry(0, http(404, {}))).toBe(false);
  });
});

describe('invoice math matches backend buildInvoiceItems', () => {
  it('computes discount before tax', () => {
    const products = new Map([['p', { price: 200, discount: 10, taxRate: 18 }]]);
    const t = estimateTotals([{ productId: 'p', quantity: 2 }], products);
    expect(t.subTotal).toBe(400);
    expect(t.totalDiscount).toBe(40);
    expect(t.totalTax).toBeCloseTo(64.8);
    expect(t.grandTotal).toBeCloseTo(424.8);
  });
});

describe('payload + schemas', () => {
  it('strips empty strings / objects', () => {
    expect(stripEmpty({ a: '', b: 'x', c: { d: '' }, e: { f: 'y' } })).toEqual({ b: 'x', e: { f: 'y' } });
  });
  it('login enforces the backend password policy', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'weakpass' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'Str0ng@pass' }).success).toBe(true);
  });
  it('signup requires matching passwords', () => {
    const r = signupSchema.safeParse({ username: 'abc', email: 'a@b.co', password: 'Str0ng@pass', confirmPassword: 'nope' });
    expect(r.error.issues[0].path).toEqual(['confirmPassword']);
  });
  it('customer: optional fields may be blank, shipping validated only when enabled', () => {
    const base = {
      customerName: 'Acme Ltd', email: 'a@b.co', phone: '9876543210', companyName: '', gstNumber: '', customerType: 'Business', notes: '',
      billingAddress: { addressLine1: '1 St', addressLine2: '', city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411001' },
      shippingDifferent: false, shippingAddress: emptyAddress,
    };
    expect(customerSchema.safeParse(base).success).toBe(true);
    expect(customerSchema.safeParse({ ...base, shippingDifferent: true }).success).toBe(false);
    expect(customerSchema.safeParse({ ...base, phone: '123' }).success).toBe(false);
  });
  it('invoice: customer required on create only', () => {
    const v = { customerId: '', items: [{ productId: 'p', quantity: 1 }], dueDate: '2030-01-01', status: 'Pending', paymentMethod: '', notes: '', termsAndConditions: '' };
    expect(makeInvoiceSchema(false).safeParse(v).success).toBe(false);
    expect(makeInvoiceSchema(true).safeParse(v).success).toBe(true);
  });
  it('past due = Pending and due date in the past (same rule as backend stat)', () => {
    expect(isPastDue({ status: 'Pending', dueDate: '2000-01-01' })).toBe(true);
    expect(isPastDue({ status: 'Paid', dueDate: '2000-01-01' })).toBe(false);
  });
});
