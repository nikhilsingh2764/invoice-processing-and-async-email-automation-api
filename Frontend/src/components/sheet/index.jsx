// "Invoice Document" building blocks. Every screen is a sheet made of the same zones:
// letterhead, meta strip, parties, ledger, totals, footer notes. Only ONE signature element per viewport.
import { Link } from 'react-router'
import { cn } from '../../lib/cn.js'
import { formatMoney } from '../../lib/format.js'

export function Sheet({ children, className, fold = false, stack = false, a4 = false, pad = true, as: Tag = 'section', ...rest }) {
  return (
    <Tag className={cn('sheet', fold && 'sheet-fold', stack && 'paper-stack', a4 && 'sheet-a4', pad && !a4 && 'sheet-pad', className)} {...rest}>
      {children}
    </Tag>
  )
}

/** Zone 1. `crumbs`: [{to,label}] ending with the current page (no `to`). */
export function Letterhead({ title, description, actions, crumbs, titleId = 'page-title' }) {
  return (
    <header className="letterhead">
      <div className="letterhead-text">
        {crumbs && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.label} style={{ display: 'inline-flex', gap: 4 }}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="letterhead-title" id={titleId} tabIndex={-1}>
          {title}
        </h1>
        {description && <p className="letterhead-desc">{description}</p>}
      </div>
      {actions && <div className="letterhead-actions">{actions}</div>}
    </header>
  )
}

export function MetaStrip({ children, label }) {
  return (
    <dl className="meta-strip" aria-label={label}>
      {children}
    </dl>
  )
}
export function MetaCell({ label, value, hint, children }) {
  return (
    <div className="meta-cell">
      <dt className="meta-label">{label}</dt>
      <dd className="meta-value" style={{ margin: 0 }}>
        {children ?? value}
      </dd>
      {hint && <dd className="meta-hint" style={{ margin: 0 }}>{hint}</dd>}
    </div>
  )
}

/** Key/value rows joined by a dotted leader line. */
export function KeyValue({ rows }) {
  const shown = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
  return (
    <dl className="kv">
      {shown.map((r) => (
        <div key={r.label} className="kv-row">
          <dt>{r.label}</dt>
          <span className="leader" aria-hidden="true" />
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Address({ value }) {
  if (!value) return null
  const line = [value.city, value.state, value.postalCode].filter(Boolean).join(', ')
  return (
    <address style={{ fontStyle: 'normal', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
      {value.addressLine1 && <div>{value.addressLine1}</div>}
      {value.addressLine2 && <div>{value.addressLine2}</div>}
      {line && <div>{line}</div>}
      {value.country && <div>{value.country}</div>}
    </address>
  )
}

export function Party({ title, name, lines = [], address, children }) {
  return (
    <div>
      <h3 className="party-title">{title}</h3>
      <p className="party-name">{name}</p>
      {lines.filter(Boolean).map((l) => (
        <p key={l} className="muted" style={{ fontSize: 'var(--text-sm)', overflowWrap: 'anywhere' }}>{l}</p>
      ))}
      <Address value={address} />
      {children}
    </div>
  )
}

/** Zone 5. Amounts come from the server totals; the grand row carries the double rule. */
export function Totals({ currency = 'INR', subTotal, totalDiscount, totalTax, grandTotal, note }) {
  const money = (v) => formatMoney(v, currency)
  return (
    <div className="totals" role="group" aria-label="Totals">
      <div className="totals-row"><span>Subtotal</span><span className="leader" aria-hidden="true" /><span className="totals-value">{money(subTotal)}</span></div>
      {totalDiscount > 0 && <div className="totals-row"><span>Discount</span><span className="leader" aria-hidden="true" /><span className="totals-value">−{money(totalDiscount)}</span></div>}
      <div className="totals-row"><span>Tax</span><span className="leader" aria-hidden="true" /><span className="totals-value">{money(totalTax)}</span></div>
      <div className="totals-grand"><span>Total</span><span className="leader" aria-hidden="true" /><span className="totals-value">{money(grandTotal)}</span></div>
      {note && <p className="totals-note">{note}</p>}
    </div>
  )
}

export function Stamp({ status, animate = false, className }) {
  return (
    <span className={cn('stamp', className)} data-status={status} data-animate={animate ? 'true' : undefined}>
      {status}
    </span>
  )
}
export const Perforation = () => <hr className="perforation" aria-hidden="true" />

/** A numbered form zone: heading + fields. */
export function FormZone({ n, title, description, children, id }) {
  return (
    <section className="form-zone" aria-labelledby={id}>
      <div>
        <h2 className="zone-heading" id={id}>
          {n && <span className="zone-number" aria-hidden="true">{n}</span>}
          {title}
        </h2>
        {description && <p className="muted" style={{ marginBlockStart: 4 }}>{description}</p>}
      </div>
      {children}
    </section>
  )
}
