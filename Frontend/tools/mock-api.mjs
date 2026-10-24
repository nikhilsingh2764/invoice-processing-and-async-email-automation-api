// Local mock of the InvoicePilot API (contract from Backend/src). Zero dependencies. In-memory data.
// Demo user: demo@example.com / Demo@1234. Signup OTP is always 123456. Flags: MOCK_HEALTH_DOWN=1, MOCK_SLOW_PDF=1.
import http from 'node:http'
import { randomBytes } from 'node:crypto'

const PORT = Number(process.env.MOCK_PORT || 4000)
const BASE = '/api/v1'
const id = () => randomBytes(12).toString('hex')
const now = () => new Date().toISOString()
const db = { users: [], pending: new Map(), sessions: new Map(), refresh: new Map(), business: new Map(), customers: [], products: [], invoices: [], counters: new Map(), jobs: new Map(), failed: new Map() }
export const PDF_BYTES = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF')

const addr = { addressLine1: '12 MG Road', city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411001' }
function seed() {
  const u = { _id: id(), username: 'demo_user', email: 'demo@example.com', password: 'Demo@1234', isVerified: true, isActive: true, provider: 'LOCAL', createdAt: now(), fails: 0 }
  db.users.push(u)
  db.business.set(u._id, { _id: id(), businessName: 'Studio Meridian', ownerName: 'Demo Owner', email: 'studio@example.com', phone: '9876543210', gstNumber: '27AAAAA0000A1Z5', address: addr, currency: 'INR', invoicePrefix: 'INV', invoiceStartNumber: 1000, termsAndConditions: 'Payment due within 30 days.' })
  db.counters.set(u._id, 1000)
}
seed()

const paise = (n) => Math.round(Number(n) * 100)
const units = (p) => Number((p / 100).toFixed(2))
function price(items, products) {
  let sub = 0, disc = 0, tax = 0
  const lines = items.map((it) => {
    const p = products.find((x) => x._id === it.productId)
    const s = Math.round(paise(p.price) * it.quantity), d = Math.round((s * p.discount) / 100), t = Math.round(((s - d) * p.taxRate) / 100)
    sub += s; disc += d; tax += t
    return { productId: p._id, productName: p.productName, description: p.description, category: p.category, unit: p.unit, price: p.price, quantity: it.quantity, taxRate: p.taxRate, discount: p.discount, lineTotal: units(s - d + t) }
  })
  return { items: lines, subTotal: units(sub), totalDiscount: units(disc), totalTax: units(tax), grandTotal: units(sub - disc + tax) }
}

const send = (res, status, body, headers = {}) => { const b = JSON.stringify(body); res.writeHead(status, { 'Content-Type': 'application/json', ...headers }); res.end(b) }
const ok = (res, data, message = 'OK', status = 200, headers) => send(res, status, { success: true, statuscode: status, message, data }, headers)
const fail = (res, status, message, errors) => send(res, status, { success: false, message, ...(errors ? { errors } : {}) })
const cookies = (req) => Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]))
const setCookies = (access, refresh) => [`accessToken=${access}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900`, `refreshToken=${refresh}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1296000`]
const clearCookies = () => ['accessToken=; Path=/; Max-Age=0', 'refreshToken=; Path=/; Max-Age=0']
const required = (b, fields) => fields.filter((f) => b[f] === undefined || b[f] === '').map((f) => ({ path: f, msg: `${f} is required` }))
const limits = new Map()
const hit = (key, max, ms) => { const t = Date.now(); const a = (limits.get(key) || []).filter((x) => t - x < ms); a.push(t); limits.set(key, a); return a.length > max }

function login(res, user) {
  const access = `a.${user._id}.${Date.now() + 15 * 60000}`, refresh = `r.${randomBytes(16).toString('hex')}`
  db.refresh.set(refresh, user._id)
  return ok(res, { user: { id: user._id, email: user.email, username: user.username } }, 'Login successful', 200, { 'Set-Cookie': setCookies(access, refresh) })
}
function authed(req, res) {
  const t = cookies(req).accessToken
  if (!t) return fail(res, 401, 'Authentication token is required'), null
  const [, uid, exp] = t.split('.')
  if (Number(exp) < Date.now()) return fail(res, 401, 'Authentication token has expired'), null
  const u = db.users.find((x) => x._id === uid)
  if (!u) return fail(res, 401, 'Invalid authentication token'), null
  return u
}
const publicUser = (u) => ({ _id: u._id, username: u.username, email: u.email, isVerified: u.isVerified, isActive: u.isActive, createdAt: u.createdAt })
const body = (req) => new Promise((r) => { let s = ''; req.on('data', (c) => (s += c)); req.on('end', () => { try { r(s ? JSON.parse(s) : {}) } catch { r({}) } }) })

function dashboard(u, q) {
  const all = db.invoices.filter((i) => i.userId === u._id)
  const num = (v, d) => Math.max(1, Number(v) || d)
  const page = num(q.page, 1), limit = Math.min(100, num(q.limit, 10))
  let list = all
  if (q.search) { const rx = new RegExp(q.search, 'i'); list = list.filter((i) => rx.test(i.invoiceNumber) || rx.test(i.customer.customerName)) }
  if (q.paymentStatus) list = list.filter((i) => i.status === q.paymentStatus)
  if (q.startDate) list = list.filter((i) => i.createdAt >= q.startDate)
  if (q.endDate) list = list.filter((i) => i.createdAt <= `${q.endDate}T23:59:59.999Z`)
  const key = ['createdAt', 'invoiceDate', 'dueDate', 'grandTotal', 'invoiceNumber', 'status'].includes(q.sortBy) ? q.sortBy : 'createdAt'
  const dir = q.sortOrder === 'asc' ? 1 : -1
  list = [...list].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir)
  const paid = all.filter((i) => i.status === 'Paid')
  const months = new Map()
  paid.forEach((i) => { const d = new Date(i.createdAt), k = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`; const m = months.get(k) || { _id: { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 }, totalRevenue: 0, totalInvoices: 0 }; m.totalRevenue += i.grandTotal; m.totalInvoices += 1; months.set(k, m) })
  const byStatus = {}; all.forEach((i) => (byStatus[i.status] = (byStatus[i.status] || 0) + 1))
  const prod = new Map(); paid.forEach((i) => i.items.forEach((it) => { const p = prod.get(it.productId) || { _id: it.productId, productName: it.productName, totalQuantitySold: 0, totalRevenue: 0 }; p.totalQuantitySold += it.quantity; p.totalRevenue += it.lineTotal; prod.set(it.productId, p) }))
  return {
    stats: { totalCustomers: db.customers.filter((c) => c.userId === u._id).length, totalProducts: db.products.filter((p) => p.userId === u._id).length, totalInvoices: all.length, paidInvoices: paid.length, pendingInvoices: all.filter((i) => i.status === 'Pending').length, overdueInvoices: all.filter((i) => i.status === 'Pending' && new Date(i.dueDate) < new Date()).length, totalRevenue: units(paid.reduce((s, i) => s + paise(i.grandTotal), 0)), totalDueAmount: units(all.filter((i) => i.status === 'Pending').reduce((s, i) => s + paise(i.grandTotal), 0)) },
    invoices: { invoices: list.slice((page - 1) * limit, page * limit), pagination: { currentPage: page, totalPages: Math.max(1, Math.ceil(list.length / limit)), totalDocs: list.length, limit } },
    revenueChart: [...months.values()],
    invoiceStatusChart: Object.entries(byStatus).map(([s, n]) => ({ _id: s, totalInvoices: n })),
    topCustomers: paid.length ? [{ _id: null, totalInvoices: paid.length, totalRevenue: 0 }] : [], // B2: invoices carry no customerId, so the server groups everything under null
    topProducts: [...prod.values()],
    recentInvoices: [...all].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5),
  }
}

const crud = (name, coll, fields, extra) => async (req, res, u, parts, b) => {
  const [, rid] = parts
  const mine = db[coll].filter((x) => x.userId === u._id)
  if (req.method === 'GET' && !rid) return ok(res, mine)
  if (req.method === 'POST') { const e = required(b, fields); if (e.length) return fail(res, 400, 'Validation failed', e); const row = { _id: id(), userId: u._id, ...b, ...(extra?.(b) || {}), createdAt: now() }; db[coll].push(row); return ok(res, row, `${name} created`, 201) }
  const row = mine.find((x) => x._id === rid)
  if (!row) return fail(res, 404, `${name} not found`)
  if (req.method === 'PATCH') { Object.assign(row, b); return ok(res, row) }
  if (req.method === 'DELETE') { db[coll] = db[coll].filter((x) => x !== row); return ok(res, null, `${name} deleted`) }
  return fail(res, 405, 'Method not allowed')
}
const customers = crud('Customer', 'customers', ['customerName', 'email', 'phone', 'billingAddress'])
const products = crud('Product', 'products', ['productName', 'description', 'category', 'unit', 'price'])

async function invoices(req, res, u, parts, b, url) {
  const [, rid, action] = parts
  const biz = db.business.get(u._id)
  const mine = db.invoices.filter((i) => i.userId === u._id)
  if ((parts[1] === 'email' || parts[1] === 'pdf') && parts[2] === 'status') {
    const j = db.jobs.get(parts[3]); if (!j) return fail(res, 404, 'Job not found')
    j.polls += 1
    return send(res, 200, { success: true, jobId: parts[3], status: j.polls > (parts[1] === 'pdf' && process.env.MOCK_SLOW_PDF ? 40 : 2) ? 'completed' : 'active' })
  }
  if (req.method === 'POST' && !rid) {
    if (!biz) return fail(res, 404, 'Business profile not found')
    const e = required(b, ['customerId', 'items', 'dueDate']); if (e.length) return fail(res, 400, 'Validation failed', e)
    const c = db.customers.find((x) => x._id === b.customerId && x.userId === u._id); if (!c) return fail(res, 404, 'Customer not found')
    const n = (db.counters.get(u._id) || 0) + 1; db.counters.set(u._id, n)
    const calc = price(b.items, db.products.filter((p) => p.userId === u._id))
    const inv = { _id: id(), userId: u._id, invoiceNumber: `${biz.invoicePrefix}-${n}`, business: biz, customer: c, ...calc, invoiceDate: now(), dueDate: b.dueDate, status: b.status || 'Pending', paymentMethod: b.paymentMethod, notes: b.notes, termsAndConditions: biz.termsAndConditions, createdAt: now(), updatedAt: now() }
    db.invoices.push(inv); return ok(res, inv, 'Invoice created', 201)
  }
  const inv = mine.find((i) => i._id === rid)
  if (!inv) return fail(res, 404, 'Invoice not found')
  if (req.method === 'GET' && !action) return ok(res, inv)
  if (req.method === 'PATCH') {
    if (b.items) Object.assign(inv, price(b.items, db.products.filter((p) => p.userId === u._id)))
    if (b.customerId) inv.customer = db.customers.find((x) => x._id === b.customerId) || inv.customer
    for (const k of ['dueDate', 'status', 'paymentMethod', 'notes', 'termsAndConditions']) if (b[k] !== undefined) inv[k] = b[k]
    inv.updatedAt = now(); return ok(res, inv)
  }
  if (req.method === 'DELETE') { db.invoices = db.invoices.filter((i) => i !== inv); return ok(res, null, 'Invoice deleted') }
  if (action === 'duplicate') { const n = (db.counters.get(u._id) || 0) + 1; db.counters.set(u._id, n); const copy = { ...structuredClone(inv), _id: id(), invoiceNumber: `${biz.invoicePrefix}-${n}`, status: 'Draft', createdAt: now(), updatedAt: now() }; db.invoices.push(copy); return ok(res, copy, 'Invoice duplicated', 201) }
  if (action === 'email') { if (hit(`mail${u._id}`, 30, 3600000)) return fail(res, 429, 'Too many requests. Please try again later.'); const jobId = id(); db.jobs.set(jobId, { polls: 0 }); return send(res, 202, { success: true, message: 'Invoice email queued', jobId }) }
  if (action === 'pdf') {
    if (inv.pdfReady) { res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${inv.invoiceNumber}.pdf"` }); return res.end(PDF_BYTES) }
    const jobId = id(); db.jobs.set(jobId, { polls: 0 }); setTimeout(() => (inv.pdfReady = true), process.env.MOCK_SLOW_PDF ? 60000 : 3500)
    return send(res, 202, { success: true, message: 'PDF generation started', jobId })
  }
  return fail(res, 404, 'Not found')
}

async function route(req, res) {
  const url = new URL(req.url, 'http://x')
  if (!url.pathname.startsWith(BASE)) return fail(res, 404, 'Not found')
  const parts = url.pathname.slice(BASE.length).split('/').filter(Boolean)
  const p0 = parts[0]
  const b = ['GET', 'HEAD'].includes(req.method) ? {} : await body(req)
  if (p0 === 'health') return send(res, process.env.MOCK_HEALTH_DOWN ? 503 : 200, { success: !process.env.MOCK_HEALTH_DOWN, status: process.env.MOCK_HEALTH_DOWN ? 'DOWN' : 'UP', services: { api: 'UP', mongodb: 'UP', redis: process.env.MOCK_HEALTH_DOWN ? 'DOWN' : 'UP' }, timestamp: now() })
  if (p0 === 'signup') {
    const e = required(b, ['username', 'email', 'password']); if (e.length) return fail(res, 400, 'Validation failed', e)
    if (db.users.some((x) => x.username === b.username)) return fail(res, 409, 'Username already exists')
    const email = String(b.email).toLowerCase(); db.pending.set(email, { ...b, email, tries: 0 })
    return ok(res, { email }, 'OTP sent to email', 201)
  }
  if (p0 === 'verify-otp') {
    const p = db.pending.get(String(b.email).toLowerCase()); if (!p) return fail(res, 400, 'OTP expired or invalid')
    if (hit(`otp${b.email}`, 10, 900000)) return fail(res, 429, 'Too many OTP verification attempts.')
    if (b.otp !== '123456') return fail(res, 400, 'Invalid OTP')
    db.users.push({ _id: id(), username: p.username, email: p.email, password: p.password, isVerified: true, isActive: true, provider: 'LOCAL', createdAt: now(), fails: 0 }); db.pending.delete(p.email)
    return ok(res, null, 'Email verified')
  }
  if (p0 === 'login') {
    if (hit(`login${req.socket.remoteAddress}`, 20, 60000)) return fail(res, 429, 'Too many login attempts. Try again after 1 minute.')
    const u = db.users.find((x) => x.email === String(b.email).toLowerCase())
    if (!u) return fail(res, 400, 'Invalid email or password')
    if (u.lockUntil > Date.now()) return fail(res, 429, 'Account temporarily locked')
    if (u.password !== b.password) { u.fails += 1; if (u.fails >= 5) u.lockUntil = Date.now() + 900000; return fail(res, 400, 'Invalid email or password') }
    u.fails = 0; return login(res, u)
  }
  if (p0 === 'google') { let u = db.users.find((x) => x.email === 'google@example.com'); if (!u) db.users.push((u = { _id: id(), username: 'google_user', email: 'google@example.com', isVerified: true, isActive: true, provider: 'GOOGLE', createdAt: now() })); return login(res, u) }
  if (p0 === 'refresh-token') { const uid = db.refresh.get(cookies(req).refreshToken); const u = db.users.find((x) => x._id === uid); if (!u) return fail(res, 401, 'Invalid refresh token', undefined); db.refresh.delete(cookies(req).refreshToken); return login(res, u) }
  if (p0 === 'logout') return ok(res, null, 'Logged out', 200, { 'Set-Cookie': clearCookies() })
  if (p0 === 'forgot-password') { const u = db.users.find((x) => x.email === String(b.email).toLowerCase()); if (!u) return fail(res, 404, 'User not found'); if (u.provider === 'GOOGLE') return fail(res, 400, 'Google account does not support password reset. Please login with Google.'); u.resetOtp = '123456'; return ok(res, null, 'OTP sent') }
  if (p0 === 'reset-password') { const u = db.users.find((x) => x.email === String(b.email).toLowerCase()); if (!u || u.resetOtp !== b.otp) return fail(res, 400, 'Invalid OTP'); u.password = b.newPassword; delete u.resetOtp; return ok(res, null, 'Password reset') }
  const u = authed(req, res); if (!u) return
  if (p0 === 'profile') return ok(res, publicUser(u))
  if (p0 === 'update-profile') { if (db.users.some((x) => x !== u && x.username === b.username)) return fail(res, 400, 'Username already exists'); u.username = b.username; return ok(res, publicUser(u)) }
  if (p0 === 'change-password') { if (u.provider === 'GOOGLE') return fail(res, 400, 'Google accounts cannot use password authentication'); if (u.password !== b.oldPassword) return fail(res, 401, 'Old password is incorrect'); u.password = b.newPassword; return ok(res, null, 'Password changed') }
  if (p0 === 'deactivate-account') { u.isActive = false; return ok(res, null, 'Account deactivated', 200, { 'Set-Cookie': clearCookies() }) }
  if (p0 === 'delete-account') { if (u.provider === 'GOOGLE') return fail(res, 400, 'Google accounts cannot use password authentication'); if (u.password !== b.password) return fail(res, 401, 'Invalid password'); db.users = db.users.filter((x) => x !== u); return ok(res, null, 'Account deleted', 200, { 'Set-Cookie': clearCookies() }) }
  if (p0 === 'business') {
    const cur = db.business.get(u._id)
    if (req.method === 'GET') return cur ? ok(res, { ...cur, nextInvoiceNumber: (db.counters.get(u._id) || 0) + 1 }) : fail(res, 404, 'Business profile not found')
    if (req.method === 'DELETE') { db.business.delete(u._id); return ok(res, null, 'Business deleted') }
    if (req.method === 'POST') { const e = required(b, ['businessName', 'ownerName', 'email', 'phone', 'address']); if (e.length) return fail(res, 400, 'Validation failed', e); if (cur) return fail(res, 409, 'Business already exists'); db.business.set(u._id, { _id: id(), ...b }); db.counters.set(u._id, Number(b.invoiceStartNumber || 1)); return ok(res, db.business.get(u._id), 'Business created', 201) }
    if (!cur) return fail(res, 404, 'Business profile not found')
    Object.assign(cur, b); return ok(res, cur)
  }
  if (p0 === 'customer') return customers(req, res, u, parts, b)
  if (p0 === 'product') return products(req, res, u, parts, b)
  if (p0 === 'invoice') return invoices(req, res, u, parts, b, url)
  if (p0 === 'dashboard') return ok(res, dashboard(u, Object.fromEntries(url.searchParams)))
  return fail(res, 404, 'Not found')
}

export function startMock(port = PORT) {
  const server = http.createServer((req, res) => route(req, res).catch((e) => { console.error(e); fail(res, 500, 'Internal server error') }))
  return new Promise((r) => server.listen(port, () => r(server)))
}
if (import.meta.url === `file://${process.argv[1]}`) startMock().then(() => console.log(`Mock API on http://localhost:${PORT}${BASE}  (demo@example.com / Demo@1234, OTP 123456)`))
