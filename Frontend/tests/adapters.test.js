import { describe, expect, it } from 'vitest'
import { adaptBusiness, adaptDashboard, adaptHealth, adaptInvoice } from '../src/api/adapters.js'
import { buildBusiness, buildCustomer, buildInvoice, buildInvoiceUpdate, buildLogin } from '../src/api/payloads.js'
import { dashboardParams } from '../src/api/params.js'

describe('adaptInvoice', () => {
  it('folds aliases and defaults', () => {
    const i = adaptInvoice({ _id: 'x', invoiceNumber: 'INV-1', totalAmount: '99.5', paymentStatus: 'Paid', items: null, customer: { customerName: 'A' } })
    expect(i.id).toBe('x')
    expect(i.grandTotal).toBe(99.5)
    expect(i.status).toBe('Paid')
    expect(i.items).toEqual([])
  })
  it('never trusts an unknown status', () => expect(adaptInvoice({ status: 'Hacked' }).status).toBe('Pending'))
})

describe('adaptDashboard', () => {
  const raw = {
    stats: { totalRevenue: '100', totalDueAmount: 50 },
    invoices: { invoices: [{ _id: 'a' }], pagination: { currentPage: 2, totalPages: 5, totalDocs: 42, limit: 10 } },
    revenueChart: [{ _id: { year: 2026, month: 3 }, totalRevenue: 5, totalInvoices: 1 }, { _id: { year: 2026, month: 1 }, totalRevenue: 7, totalInvoices: 2 }],
    topCustomers: [{ _id: null, totalInvoices: 3, totalRevenue: 0 }],
    topProducts: [{ _id: 'p1', productName: 'A', totalQuantitySold: 2, totalRevenue: 10 }, { _id: 'p2', productName: 'B', totalQuantitySold: 9, totalRevenue: 5 }],
  }
  it('reads totalDocs (real server) as the invoice total', () => expect(adaptDashboard(raw).pagination).toEqual({ total: 42, page: 2, pages: 5, limit: 10 }))
  it('accepts the documented totalInvoices name too', () => expect(adaptDashboard({ invoices: { invoices: [], pagination: { totalInvoices: 7 } } }).pagination.total).toBe(7))
  it('sorts the revenue chart by month', () => expect(adaptDashboard(raw).revenueChart.map((m) => m.month)).toEqual([1, 3]))
  it('B2: drops null-id customers and flags the collapse', () => {
    const d = adaptDashboard(raw)
    expect(d.topCustomers).toHaveLength(0)
    expect(d.topCustomersCollapsed).toBe(true)
  })
  it('B3: sorts top products by quantity', () => expect(adaptDashboard(raw).topProducts[0].name).toBe('B'))
  it('survives an empty payload', () => expect(adaptDashboard(undefined).stats.totalRevenue).toBe(0))
})

describe('adaptBusiness / adaptHealth', () => {
  it('returns null for no business', () => expect(adaptBusiness(null)).toBeNull())
  it('health: UP means ok, a DOWN service is reported', () => {
    expect(adaptHealth({ success: true, status: 'UP', services: { api: 'UP', mongodb: 'UP', redis: 'UP' } }).ok).toBe(true)
    const h = adaptHealth({ success: false, status: 'DOWN', services: { api: 'UP', mongodb: 'UP', redis: 'DOWN' } })
    expect(h.ok).toBe(false)
    expect(h.services.redis).toBe(false)
  })
})

describe('payload builders whitelist fields', () => {
  it('login ignores extra fields and lower-cases email', () => expect(buildLogin({ email: ' A@B.co ', password: 'p', isAdmin: true })).toEqual({ email: 'a@b.co', password: 'p' }))
  it('customer omits shippingAddress when same', () => {
    const a = { addressLine1: 'x', city: 'y', state: 's', country: 'India', postalCode: '411001' }
    const out = buildCustomer({ customerName: 'n', email: 'E@X.co', phone: '1', customerType: 'Business', billingAddress: a, shippingSame: true, shippingAddress: a, role: 'admin' })
    expect('shippingAddress' in out).toBe(false)
    expect('role' in out).toBe(false)
    expect(out.email).toBe('e@x.co')
  })
  it('business drops empty optionals', () => expect('gstNumber' in buildBusiness({ businessName: 'b', gstNumber: '', address: {} })).toBe(false))
  it('invoice sends only ids and quantities (prices come from the server)', () => {
    const out = buildInvoice({ customerId: 'c', items: [{ productId: 'p', quantity: '2', price: 1 }], dueDate: '2026-12-01', status: 'Pending', grandTotal: 1 })
    expect(out.items).toEqual([{ productId: 'p', quantity: 2 }])
    expect('grandTotal' in out).toBe(false)
  })
  it('invoice update sends only what changed', () => {
    const original = { customerId: 'c', items: [{ productId: 'p', quantity: 2 }], dueDate: '2026-12-01T00:00:00.000Z', status: 'Pending', paymentMethod: '', notes: '', termsAndConditions: 'T' }
    const same = { customerId: 'c', items: [{ productId: 'p', quantity: '2' }], dueDate: '2026-12-01', status: 'Pending', paymentMethod: '', notes: '', termsAndConditions: 'T' }
    expect(buildInvoiceUpdate(same, original)).toEqual({})
    expect(buildInvoiceUpdate({ ...same, status: 'Paid', termsAndConditions: 'New' }, original)).toEqual({ status: 'Paid', termsAndConditions: 'New' })
  })
})

describe('dashboardParams', () => {
  it('escapes the search term and whitelists the sort field', () => {
    const p = dashboardParams({ q: 'a.b(', sort: 'password', status: 'Paid', page: 2 })
    expect(p.search).toBe('a\\.b\\(')
    expect(p.sortBy).toBe('createdAt')
    expect(p.paymentStatus).toBe('Paid')
  })
})
