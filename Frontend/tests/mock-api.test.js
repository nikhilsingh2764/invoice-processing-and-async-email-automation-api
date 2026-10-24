// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startMock } from '../tools/mock-api.mjs'

let server
let cookie = ''
const B = 'http://localhost:4123/api/v1'
const call = async (method, path, body) => {
  const r = await fetch(B + path, { method, headers: { 'Content-Type': 'application/json', cookie }, body: body ? JSON.stringify(body) : undefined })
  const set = r.headers.getSetCookie?.() || []
  if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ')
  const type = r.headers.get('content-type') || ''
  return { status: r.status, type, data: type.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()) }
}
const state = {}

describe('mock API honours the backend contract', () => {
  beforeAll(async () => { server = await startMock(4123) })
  afterAll(() => server.close())

  it('rejects a wrong password, then logs in with HttpOnly cookies', async () => {
    expect((await call('POST', '/login', { email: 'demo@example.com', password: 'bad' })).status).toBe(400)
    const r = await call('POST', '/login', { email: 'demo@example.com', password: 'Demo@1234' })
    expect(r.status).toBe(200)
    expect(cookie).toMatch(/accessToken=/)
    expect(cookie).toMatch(/refreshToken=/)
  })
  it('uses the lowercase statuscode envelope and a validation errors array', async () => {
    const ok = await call('GET', '/profile')
    expect(ok.data.statuscode).toBe(200)
    const bad = await call('POST', '/customer', { customerName: 'x' })
    expect(bad.status).toBe(400)
    expect(Array.isArray(bad.data.errors)).toBe(true)
  })
  it('creates invoices numbered PREFIX-(start+1) with server maths', async () => {
    const c = (await call('POST', '/customer', { customerName: 'Acme', email: 'a@acme.co', phone: '9999999999', billingAddress: {} })).data.data
    const p = (await call('POST', '/product', { productName: 'Design', description: 'd', category: 'x', unit: 'service', price: 100.5, taxRate: 18, discount: 10 })).data.data
    const r = await call('POST', '/invoice', { customerId: c._id, items: [{ productId: p._id, quantity: 3 }], dueDate: new Date(Date.now() - 864e5).toISOString() })
    expect(r.status).toBe(201)
    expect(r.data.data.invoiceNumber).toBe('INV-1001')
    expect(r.data.data.grandTotal).toBe(320.19)
    state.id = r.data.data._id
  })
  it('PDF: 202 with a jobId, job completes, then 200 with %PDF-', async () => {
    const first = await call('GET', `/invoice/${state.id}/pdf`)
    expect(first.status).toBe(202)
    let s
    for (let i = 0; i < 4; i += 1) s = (await call('GET', `/invoice/pdf/status/${first.data.jobId}`)).data.status
    expect(s).toBe('completed')
    await new Promise((r) => setTimeout(r, 3700))
    const done = await call('GET', `/invoice/${state.id}/pdf`)
    expect(done.status).toBe(200)
    expect(done.type).toMatch(/application\/pdf/)
    expect(done.data.subarray(0, 5).toString()).toBe('%PDF-')
  })
  it('email returns 202 {jobId}', async () => expect((await call('POST', `/invoice/${state.id}/email`)).status).toBe(202))
  it('dashboard has the real shape, including B2 (null-id top customer)', async () => {
    await call('PATCH', `/invoice/${state.id}`, { status: 'Paid' })
    const d = (await call('GET', '/dashboard?page=1&limit=10')).data.data
    expect(d.stats.totalRevenue).toBe(320.19)
    expect(d.invoices.pagination.totalDocs).toBe(1)
    expect(d.topCustomers[0]._id).toBeNull()
  })
  it('expired and invalid tokens return the documented messages; refresh recovers', async () => {
    const good = cookie
    cookie = cookie.replace(/accessToken=[^;]*/, 'accessToken=garbage')
    expect((await call('GET', '/profile')).data.message).toBe('Invalid authentication token')
    cookie = ''
    expect((await call('GET', '/profile')).data.message).toBe('Authentication token is required')
    cookie = good
    expect((await call('POST', '/refresh-token')).status).toBe(200)
    expect((await call('GET', '/profile')).status).toBe(200)
  })
  it('health answers 200 when healthy', async () => expect((await call('GET', '/health')).data.services.mongodb).toBe('UP'))
})
