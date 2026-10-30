// The on-screen invoice: one compact "receipt" card that reads the same on a 320px Android phone and on desktop.
// The items stay a real table on every screen size (Item / Qty / Amount on phones, plus Price and Tax from 480px).
import { formatDate, formatMoney } from '../../lib/format.js'
import { safeUrl } from '../../lib/security.js'

function Addr({ value }) {
  if (!value) return null
  const city = [value.city, value.state, value.postalCode].filter(Boolean).join(', ')
  return [value.addressLine1, value.addressLine2, city, value.country].filter(Boolean).map((l, i) => <span key={i} className="doc-line">{l}</span>)
}

function Party({ title, name, lines, address }) {
  return (
    <section className="doc-party" aria-label={title}>
      <h3 className="doc-label">{title}</h3>
      <p className="doc-party-name">{name}</p>
      <address className="doc-party-lines">
        {lines.filter(Boolean).map((l) => <span key={l} className="doc-line">{l}</span>)}
        <Addr value={address} />
      </address>
    </section>
  )
}

export function InvoiceDoc({ inv, currency, pastDue }) {
  const money = (v) => formatMoney(v, currency)
  const logo = safeUrl(inv.business.logo)
  const b = inv.business
  const c = inv.customer
  return (
    <article className="doc" aria-label={`Invoice ${inv.invoiceNumber}`}>
      <header className="doc-head">
        <div className="doc-head-text">
          {logo && <img src={logo} alt={`${b.businessName} logo`} referrerPolicy="no-referrer" className="doc-logo" />}
          <h2 className="doc-biz">{b.businessName}</h2>
          {b.ownerName && <p className="doc-owner">{b.ownerName}</p>}
        </div>
        <span className="doc-status" data-status={inv.status}>{inv.status}</span>
      </header>

      <dl className="doc-meta" aria-label="Invoice details">
        <div><dt>Invoice no.</dt><dd>{inv.invoiceNumber}</dd></div>
        <div><dt>Issued</dt><dd>{formatDate(inv.invoiceDate)}</dd></div>
        <div><dt>Due</dt><dd>{formatDate(inv.dueDate)}{pastDue && <small>Past due</small>}</dd></div>
        <div><dt>Total</dt><dd className="doc-meta-total">{money(inv.grandTotal)}</dd></div>
      </dl>

      <div className="doc-parties">
        <Party title="From" name={b.businessName} lines={[b.email, b.phone, b.gstNumber && `GST ${b.gstNumber}`]} address={b.address} />
        <Party title="Bill to" name={c.customerName} lines={[c.companyName, c.email, c.phone, c.gstNumber && `GST ${c.gstNumber}`]} address={c.billingAddress} />
      </div>

      <div className="doc-table-wrap">
        <table className="doc-table">
          <caption className="sr-only">Invoice items</caption>
          <thead>
            <tr>
              <th scope="col" className="c-no"><span className="sr-only">No.</span></th>
              <th scope="col" className="c-item">Item</th>
              <th scope="col" className="c-qty">Qty</th>
              <th scope="col" className="c-price">Price</th>
              <th scope="col" className="c-tax">Tax</th>
              <th scope="col" className="c-amt">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((r, i) => (
              <tr key={`${r.productId}-${i}`}>
                <td className="c-no">{i + 1}</td>
                <td className="c-item">
                  <span className="doc-item-name">{r.productName}</span>
                  {r.description && <span className="doc-item-desc">{r.description}</span>}
                  <span className="doc-item-sub">{money(r.price)} × {r.quantity}{r.taxRate ? ` · Tax ${r.taxRate}%` : ''}</span>
                </td>
                <td className="c-qty">{r.quantity}{r.unit ? ` ${r.unit}` : ''}</td>
                <td className="c-price">{money(r.price)}</td>
                <td className="c-tax">{r.taxRate}%</td>
                <td className="c-amt">{money(r.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="doc-totals" role="group" aria-label="Totals">
        <div><span>Subtotal</span><span>{money(inv.subTotal)}</span></div>
        {inv.totalDiscount > 0 && <div><span>Discount</span><span>−{money(inv.totalDiscount)}</span></div>}
        <div><span>Tax</span><span>{money(inv.totalTax)}</span></div>
        <div className="doc-grand"><span>Total</span><span>{money(inv.grandTotal)}</span></div>
      </div>

      <hr className="doc-perf" aria-hidden="true" />

      <footer className="doc-foot">
        {inv.paymentMethod && <p><strong>Payment method:</strong> {inv.paymentMethod}</p>}
        {inv.notes && <div><p className="doc-foot-title">Notes</p><p className="doc-pre">{inv.notes}</p></div>}
        {inv.termsAndConditions && <div><p className="doc-foot-title">Terms and conditions</p><p className="doc-pre">{inv.termsAndConditions}</p></div>}
      </footer>
    </article>
  )
}
