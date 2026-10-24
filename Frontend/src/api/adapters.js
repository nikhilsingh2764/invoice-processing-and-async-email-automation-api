// Adapter: normalises every server payload into the UI model. Components never read raw shapes.
// Numbers are coerced, arrays defaulted, aliases (totalAmount, paymentStatus) folded away.
import { monthLabel } from '../lib/format.js'
import { INVOICE_STATUSES } from '../config/enums.js'

const num = (v, d = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}
const text = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const arr = (v) => (Array.isArray(v) ? v : [])
const id = (r) => text(r?._id ?? r?.id ?? '')

export function adaptAddress(a) {
  const r = a || {}
  return { addressLine1: text(r.addressLine1), addressLine2: text(r.addressLine2), city: text(r.city), state: text(r.state), country: text(r.country || 'India'), postalCode: text(r.postalCode) }
}

export function adaptUser(raw) {
  const r = raw || {}
  return { id: id(r), username: text(r.username), email: text(r.email), isVerified: Boolean(r.isVerified), isActive: r.isActive !== false, createdAt: r.createdAt || null }
}

export function adaptBusiness(raw) {
  if (!raw) return null
  const r = raw
  return {
    id: id(r),
    businessName: text(r.businessName),
    ownerName: text(r.ownerName),
    email: text(r.email),
    phone: text(r.phone),
    gstNumber: text(r.gstNumber),
    address: adaptAddress(r.address),
    currency: text(r.currency || 'INR'),
    logo: text(r.logo),
    signature: text(r.signature),
    invoicePrefix: text(r.invoicePrefix || 'INV'),
    invoiceStartNumber: num(r.invoiceStartNumber, 1),
    nextInvoiceNumber: r.nextInvoiceNumber == null ? null : num(r.nextInvoiceNumber),
    termsAndConditions: text(r.termsAndConditions),
  }
}

export function adaptCustomer(raw) {
  const r = raw || {}
  return {
    id: id(r),
    customerName: text(r.customerName),
    email: text(r.email),
    phone: text(r.phone),
    companyName: text(r.companyName),
    gstNumber: text(r.gstNumber),
    customerType: text(r.customerType).trim() || 'Individual',
    notes: text(r.notes),
    billingAddress: adaptAddress(r.billingAddress),
    shippingAddress: r.shippingAddress && r.shippingAddress.addressLine1 ? adaptAddress(r.shippingAddress) : null,
    createdAt: r.createdAt || null,
  }
}

export function adaptProduct(raw) {
  const r = raw || {}
  return { id: id(r), productName: text(r.productName), description: text(r.description), category: text(r.category), unit: text(r.unit || 'piece'), price: num(r.price), taxRate: num(r.taxRate), discount: num(r.discount), createdAt: r.createdAt || null }
}

function adaptItem(r = {}) {
  return { productId: text(r.productId), productName: text(r.productName), description: text(r.description), category: text(r.category), unit: text(r.unit), price: num(r.price), quantity: num(r.quantity), taxRate: num(r.taxRate), discount: num(r.discount), lineTotal: num(r.lineTotal) }
}

export function adaptInvoice(raw) {
  const r = raw || {}
  const status = text(r.status ?? r.paymentStatus) || 'Pending'
  const biz = r.business || {}
  const cust = r.customer && typeof r.customer === 'object' ? r.customer : { customerName: text(r.customer) }
  return {
    id: id(r),
    invoiceNumber: text(r.invoiceNumber),
    business: { businessName: text(biz.businessName), ownerName: text(biz.ownerName), email: text(biz.email), phone: text(biz.phone), gstNumber: text(biz.gstNumber), logo: text(biz.logo), signature: text(biz.signature), currency: text(biz.currency || 'INR'), address: adaptAddress(biz.address) },
    customer: {
      customerName: text(cust.customerName),
      email: text(cust.email),
      phone: text(cust.phone),
      companyName: text(cust.companyName),
      gstNumber: text(cust.gstNumber),
      customerType: text(cust.customerType),
      billingAddress: adaptAddress(cust.billingAddress),
      shippingAddress: cust.shippingAddress && cust.shippingAddress.addressLine1 ? adaptAddress(cust.shippingAddress) : null,
    },
    items: arr(r.items).map(adaptItem),
    subTotal: num(r.subTotal),
    totalTax: num(r.totalTax),
    totalDiscount: num(r.totalDiscount),
    grandTotal: num(r.grandTotal ?? r.totalAmount),
    invoiceDate: r.invoiceDate || r.createdAt || null,
    dueDate: r.dueDate || null,
    status: INVOICE_STATUSES.includes(status) ? status : 'Pending',
    paymentMethod: text(r.paymentMethod),
    notes: text(r.notes),
    termsAndConditions: text(r.termsAndConditions),
    sent: Boolean(r.sent),
    createdAt: r.createdAt || null,
    updatedAt: r.updatedAt || null,
  }
}

export function adaptDashboard(raw) {
  const r = raw || {}
  const s = r.stats || {}
  const list = r.invoices && !Array.isArray(r.invoices) ? r.invoices : { invoices: arr(r.invoices) }
  const p = list.pagination || {}
  const limit = num(p.limit, 10) || 10
  // The real server sends totalDocs; the prompt documented totalInvoices. Accept both.
  const total = num(p.totalDocs ?? p.totalInvoices ?? p.total, arr(list.invoices).length)
  const topCustomers = arr(r.topCustomers)
    .filter((c) => c && c._id)
    .map((c) => ({ id: text(c._id), name: text(c.customerName), email: text(c.customerEmail), invoices: num(c.totalInvoices), revenue: num(c.totalRevenue) }))
  const topProducts = arr(r.topProducts)
    .filter((x) => x && (x._id || x.productName))
    .map((x) => ({ id: text(x._id), name: text(x.productName), quantity: num(x.totalQuantitySold), revenue: num(x.totalRevenue) }))
    .sort((a, b) => b.quantity - a.quantity)
  return {
    stats: {
      totalCustomers: num(s.totalCustomers),
      totalProducts: num(s.totalProducts),
      totalInvoices: num(s.totalInvoices),
      paidInvoices: num(s.paidInvoices),
      pendingInvoices: num(s.pendingInvoices),
      overdueInvoices: num(s.overdueInvoices),
      totalRevenue: num(s.totalRevenue),
      totalDueAmount: num(s.totalDueAmount),
    },
    invoices: arr(list.invoices).map(adaptInvoice),
    pagination: { total, page: num(p.currentPage, 1) || 1, pages: num(p.totalPages, Math.max(1, Math.ceil(total / limit))) || 1, limit },
    revenueChart: arr(r.revenueChart)
      .filter((m) => m && m._id)
      .map((m) => ({ year: num(m._id.year), month: num(m._id.month), label: monthLabel(num(m._id.year), num(m._id.month)), revenue: num(m.totalRevenue), invoices: num(m.totalInvoices) }))
      .sort((a, b) => a.year - b.year || a.month - b.month),
    statusChart: arr(r.invoiceStatusChart).filter((x) => x && x._id).map((x) => ({ status: text(x._id), count: num(x.totalInvoices) })),
    topCustomers,
    topCustomersCollapsed: arr(r.topCustomers).length > 0 && topCustomers.length === 0,
    topProducts,
    recentInvoices: arr(r.recentInvoices).map(adaptInvoice),
  }
}

export function adaptHealth(raw) {
  const r = raw || {}
  const svc = r.services || {}
  const up = (v) => String(v).toUpperCase() === 'UP'
  const status = text(r.status).toUpperCase()
  return { ok: r.success === true && (status === 'UP' || status === 'READY'), status: status || 'UNKNOWN', services: { api: up(svc.api), mongodb: up(svc.mongodb), redis: up(svc.redis) }, timestamp: r.timestamp || null }
}
