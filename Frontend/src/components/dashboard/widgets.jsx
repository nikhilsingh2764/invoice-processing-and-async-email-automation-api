import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { formatMoney, formatNumber } from '../../lib/format.js'
import { useCountUp } from '../../hooks/useCountUp.js'

export function CountMoney({ value, currency }) {
  const v = useCountUp(value)
  return <span className="tabular">{formatMoney(Math.round(v * 100) / 100, currency)}</span>
}

/** Collection gauge: paid / (paid + pending). SVG ring with a text equivalent. */
export function Gauge({ paid, pending, currency }) {
  const total = paid + pending
  const pct = total > 0 ? paid / total : 0
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <figure style={{ margin: 0, display: 'grid', justifyItems: 'center', gap: 8 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`${Math.round(pct * 100)} percent collected`}>
        <circle cx="70" cy="70" r={r} className="gauge-track" fill="none" strokeWidth="14" />
        <circle cx="70" cy="70" r={r} className="gauge-value" fill="none" strokeWidth="14" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 70 70)" />
        <text x="70" y="76" textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--text)" fontFamily="var(--ff-heading)">{Math.round(pct * 100)}%</text>
      </svg>
      <figcaption className="muted" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
        {total > 0 ? `${formatMoney(paid, currency)} paid of ${formatMoney(total, currency)}` : 'Nothing billed yet'}
      </figcaption>
    </figure>
  )
}

const FLOW = [
  { status: 'Draft', note: 'Not sent' },
  { status: 'Pending', note: 'Awaiting payment' },
  { status: 'Paid', note: '' },
  { status: 'Partially Paid', note: '' },
  { status: 'Overdue', note: '' },
  { status: 'Cancelled', note: '' },
]

/** Invoice flow: Draft -> Pending -> outcomes. Counts are real; amounts only where the API provides them. */
export function InvoiceFlow({ counts, paidAmount, pendingAmount, currency }) {
  const count = (s) => counts.find((c) => c.status === s)?.count ?? 0
  const amount = { Paid: paidAmount, Pending: pendingAmount }
  return (
    <ol className="flow" aria-label="Invoice flow by status" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(9.5rem, 1fr))' }}>
      {FLOW.map((f, i) => (
        <li key={f.status} className="reveal" data-in="true" style={{ '--i': i }}>
          <Link to={`/invoices?status=${encodeURIComponent(f.status)}`} className="card" style={{ display: 'grid', gap: 4, textDecoration: 'none', color: 'inherit', padding: 'var(--space-4)' }}>
            <span className="badge" data-status={f.status}><span className="badge-dot" aria-hidden="true" />{f.status}</span>
            <strong className="tabular" style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--ff-heading)' }}>{formatNumber(count(f.status))}</strong>
            {amount[f.status] != null && <span className="muted tabular" style={{ fontSize: 'var(--text-sm)' }}>{formatMoney(amount[f.status], currency)}</span>}
            <span className="muted" style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>View <ArrowRight width={12} height={12} aria-hidden="true" /></span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

/** Setup diagram for new accounts: Business -> Customer -> Product -> First invoice. */
export function SetupSteps({ hasBusiness, hasCustomers, hasProducts, hasInvoices }) {
  const steps = [
    { label: 'Business', to: '/business', done: hasBusiness, text: 'Add your name, address and invoice prefix.' },
    { label: 'Customer', to: '/customers', done: hasCustomers, text: 'Who are you billing?' },
    { label: 'Product', to: '/products', done: hasProducts, text: 'What do you sell?' },
    { label: 'First invoice', to: '/invoices/new', done: hasInvoices, text: 'Create it, then send it.' },
  ]
  const current = steps.findIndex((s) => !s.done)
  return (
    <ol className="checklist" aria-label="Setup steps" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))' }}>
      {steps.map((s, i) => (
        <li key={s.label} className="card" aria-current={i === current ? 'step' : undefined} style={{ display: 'grid', gap: 4, borderColor: i === current ? 'var(--brand)' : undefined }}>
          <span className="muted tabular" style={{ fontSize: 'var(--text-xs)' }}>Step {i + 1}{s.done ? ' · done' : ''}</span>
          <strong>{s.done ? '✓ ' : ''}{s.label}</strong>
          <span className="muted" style={{ fontSize: 'var(--text-sm)' }}>{s.text}</span>
          {!s.done && <Link to={s.to}>Open</Link>}
        </li>
      ))}
    </ol>
  )
}
