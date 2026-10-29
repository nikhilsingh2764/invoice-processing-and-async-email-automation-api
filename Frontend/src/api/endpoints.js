import { http, unwrap } from './client.js'
import { adaptBusiness, adaptCustomer, adaptDashboard, adaptHealth, adaptInvoice, adaptProduct, adaptUser } from './adapters.js'
import { buildBusiness, buildChangePassword, buildCustomer, buildDeleteAccount, buildForgot, buildGoogle, buildInvoice, buildInvoiceUpdate, buildLogin, buildProduct, buildProfile, buildReset, buildSignup, buildVerifyOtp } from './payloads.js'
import { dashboardParams } from './params.js'
import { normalizeError } from './errors.js'

export { dashboardParams }
const opts = (signal) => (signal ? { signal } : undefined)
const enc = encodeURIComponent

/** The server pages customer/product lists (default 10, max 100). Walk every page so lists, selects and search see all rows. */
async function fetchAll(path, adapt, signal) {
  const rows = []
  for (let page = 1; page <= 50; page += 1) {
    const res = await http.get(path, { params: { page, limit: 100 }, ...opts(signal) })
    const data = res?.data?.data
    rows.push(...(Array.isArray(data) ? data : []).map(adapt))
    if (!res?.data?.pagination?.hasNextPage) break
  }
  return rows
}

export const authApi = {
  signup: async (v) => unwrap(await http.post('/signup', buildSignup(v))),
  verifyOtp: async (v) => unwrap(await http.post('/verify-otp', buildVerifyOtp(v))),
  login: async (v) => unwrap(await http.post('/login', buildLogin(v))),
  google: async (idToken) => unwrap(await http.post('/google', buildGoogle(idToken))),
  logout: async () => http.post('/logout'),
  forgotPassword: async (v) => unwrap(await http.post('/forgot-password', buildForgot(v))),
  resetPassword: async (v) => unwrap(await http.post('/reset-password', buildReset(v))),
  profile: async ({ signal } = {}) => adaptUser(unwrap(await http.get('/profile', opts(signal)))),
  updateProfile: async (v) => adaptUser(unwrap(await http.patch('/update-profile', buildProfile(v)))),
  changePassword: async (v) => unwrap(await http.patch('/change-password', buildChangePassword(v))),
  deactivate: async () => unwrap(await http.patch('/deactivate-account')),
  deleteAccount: async (v) => unwrap(await http.delete('/delete-account', { data: buildDeleteAccount(v) })),
}

export const businessApi = {
  /** 404 "Business profile not found" means "no business yet", not an error. */
  get: async ({ signal } = {}) => {
    try {
      return adaptBusiness(unwrap(await http.get('/business', opts(signal))))
    } catch (error) {
      if (normalizeError(error).status === 404) return null
      throw error
    }
  },
  create: async (v) => adaptBusiness(unwrap(await http.post('/business', buildBusiness(v)))),
  update: async (v) => adaptBusiness(unwrap(await http.patch('/business', buildBusiness(v)))),
  remove: async () => unwrap(await http.delete('/business')),
}

export const customerApi = {
  list: async ({ signal } = {}) => fetchAll('/customer', adaptCustomer, signal),
  create: async (v) => adaptCustomer(unwrap(await http.post('/customer', buildCustomer(v)))),
  update: async (id, v) => adaptCustomer(unwrap(await http.patch(`/customer/${enc(id)}`, buildCustomer(v, { update: true })))),
  remove: async (id) => unwrap(await http.delete(`/customer/${enc(id)}`)),
}

export const productApi = {
  list: async ({ signal } = {}) => fetchAll('/product', adaptProduct, signal),
  create: async (v) => adaptProduct(unwrap(await http.post('/product', buildProduct(v)))),
  update: async (id, v) => adaptProduct(unwrap(await http.patch(`/product/${enc(id)}`, buildProduct(v)))),
  remove: async (id) => unwrap(await http.delete(`/product/${enc(id)}`)),
}

export const invoiceApi = {
  get: async (id, { signal } = {}) => adaptInvoice(unwrap(await http.get(`/invoice/${enc(id)}`, opts(signal)))),
  create: async (v) => adaptInvoice(unwrap(await http.post('/invoice', buildInvoice(v)))),
  update: async (id, next, original) => adaptInvoice(unwrap(await http.patch(`/invoice/${enc(id)}`, buildInvoiceUpdate(next, original)))),
  setStatus: async (id, status) => adaptInvoice(unwrap(await http.patch(`/invoice/${enc(id)}`, { status }))),
  remove: async (id) => unwrap(await http.delete(`/invoice/${enc(id)}`)),
  duplicate: async (id) => adaptInvoice(unwrap(await http.post(`/invoice/${enc(id)}/duplicate`))),
  /** 202 with { jobId }. Never retried. */
  email: async (id) => {
    const res = await http.post(`/invoice/${enc(id)}/email`)
    return { jobId: String(res.data?.jobId ?? ''), message: String(res.data?.message ?? '') }
  },
  emailStatus: async (jobId, { signal } = {}) => {
    const res = await http.get(`/invoice/email/status/${enc(jobId)}`, opts(signal))
    return String(res.data?.status ?? 'unknown')
  },
}

export const dashboardApi = {
  get: async (params, { signal } = {}) => adaptDashboard(unwrap(await http.get('/dashboard', { params: dashboardParams(params), signal }))),
}

export const healthApi = {
  /** 503 is a valid answer, not an error: the body says which service is down. */
  get: async ({ signal } = {}) => {
    const res = await http.get('/health', { signal, validateStatus: (s) => s === 200 || s === 503, timeout: 8000 })
    return adaptHealth(res.data)
  },
}
