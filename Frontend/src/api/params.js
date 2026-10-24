import { escapeRegex } from '../lib/security.js'

const DASH_SORT = ['createdAt', 'invoiceDate', 'dueDate', 'grandTotal', 'invoiceNumber', 'status']

/** Query params for GET /dashboard. `search` is escaped because the server applies it as a regex. */
export function dashboardParams({ page = 1, limit = 10, q = '', status = '', from = '', to = '', sort = 'createdAt', order = 'desc', customerId = '' } = {}) {
  const p = { page, limit, sortBy: DASH_SORT.includes(sort) ? sort : 'createdAt', sortOrder: order === 'asc' ? 'asc' : 'desc' }
  if (q && q.trim()) p.search = escapeRegex(q.trim())
  if (status) p.paymentStatus = status
  if (from) p.startDate = from
  if (to) p.endDate = to
  if (customerId) p.customerId = customerId
  return p
}

