import { ZERO_DECIMAL_CURRENCIES } from '../config/enums.js'

const cache = new Map()
const localeFor = (currency) => (currency === 'INR' ? 'en-IN' : undefined)

/** Strategy: pick the formatter by currency. Zero-decimal currencies show no decimals. */
export function moneyFormatter(currency = 'INR', { compact = false } = {}) {
  const key = `${currency}|${compact}`
  if (cache.has(key)) return cache.get(key)
  const zero = ZERO_DECIMAL_CURRENCIES.includes(currency)
  let fmt
  try {
    fmt = new Intl.NumberFormat(localeFor(currency), {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      minimumFractionDigits: compact ? 0 : zero ? 0 : 2,
      maximumFractionDigits: compact ? 1 : zero ? 0 : 2,
    })
  } catch {
    fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  cache.set(key, fmt)
  return fmt
}

export function formatMoney(value, currency = 'INR', options) {
  const n = Number(value)
  return moneyFormatter(currency, options).format(Number.isFinite(n) ? n : 0)
}

export const formatNumber = (value) => new Intl.NumberFormat(undefined).format(Number(value) || 0)

export function formatDate(value, { withTime = false } = {}) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(d)
}

export function toDateInput(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Pending invoices whose due date has passed are "past due" (the stored status is untouched). */
export function isPastDue(invoice, now = new Date()) {
  if (!invoice || invoice.status !== 'Pending' || !invoice.dueDate) return false
  const due = new Date(invoice.dueDate)
  return !Number.isNaN(due.getTime()) && due.getTime() < now.getTime()
}

export const monthLabel = (year, month) => new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' }).format(new Date(year, month - 1, 1))

export function initials(name) {
  return (
    String(name || '?')
      .split(/[\s_]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  )
}
