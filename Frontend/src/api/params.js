const DASH_SORT = ['createdAt', 'invoiceDate', 'dueDate', 'grandTotal', 'invoiceNumber', 'status']

/** Query params for GET /dashboard. The server escapes `search` itself, so it is sent as typed. */
export function dashboardParams({ page = 1, limit = 10, q = '', status = '', from = '', to = '', sort = 'createdAt', order = 'desc', customerId = '' } = {}) {
  const p = { page, limit, sortBy: DASH_SORT.includes(sort) ? sort : 'createdAt', sortOrder: order === 'asc' ? 'asc' : 'desc' }
  if (q && q.trim()) p.search = q.trim().slice(0, 100)
  if (status) p.paymentStatus = status
  if (from) p.startDate = from
  if (to) p.endDate = to
  if (customerId) p.customerId = customerId
  return p
}

