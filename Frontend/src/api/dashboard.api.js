import { client, unwrap, cleanParams } from './client';

/**
 * GET /dashboard
 * Query: page, limit(1-100), search, paymentStatus, startDate, endDate (YYYY-MM-DD, filter on createdAt),
 *        sortBy (createdAt|invoiceDate|dueDate|grandTotal|invoiceNumber|status), sortOrder (asc|desc)
 * Response data: { stats, invoices: { invoices[], pagination }, revenueChart[], invoiceStatusChart[],
 *                  topCustomers[], topProducts[], recentInvoices[] }
 * This is the ONLY invoice-list endpoint the backend exposes.
 */
export const getDashboard = (params, { signal } = {}) =>
  client.get('/dashboard', { params: cleanParams(params), signal }).then(unwrap);
