const NUMBER_FALLBACK = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMoney(value, currency) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  if (!currency) return NUMBER_FALLBACK.format(n);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${NUMBER_FALLBACK.format(n)}`;
  }
}

export function formatCompactMoney(value, currency) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      notation: 'compact',
      maximumFractionDigits: 1,
      ...(currency ? { style: 'currency', currency } : {}),
    }).format(n);
  } catch {
    return String(n);
  }
}

export const formatNumber = (v) => (Number.isFinite(Number(v)) ? new Intl.NumberFormat().format(Number(v)) : '—');

function toDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value, { utc = false } = {}) {
  const d = toDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric', ...(utc ? { timeZone: 'UTC' } : {}) }).format(d);
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

/** Value for <input type="date"> from an ISO string (date part, UTC — matches how the API stores it). */
export const toDateInputValue = (iso) => (iso ? String(iso).slice(0, 10) : '');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthLabel = (year, month) => `${MONTHS[(month || 1) - 1]} ${String(year).slice(-2)}`;

/** Mirrors the backend rule used by the dashboard's `overdueInvoices` stat: Pending and past due date. */
export function isPastDue(invoice) {
  if (invoice?.status !== 'Pending' && invoice?.paymentStatus !== 'Pending') return false;
  const d = toDate(invoice?.dueDate);
  return Boolean(d && d.getTime() < Date.now());
}

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function formatAddress(a) {
  if (!a) return '';
  return [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ');
}
