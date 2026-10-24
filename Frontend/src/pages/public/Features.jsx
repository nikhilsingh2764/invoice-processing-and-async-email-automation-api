import { PageShell } from '../../components/public/PageShell.jsx'
import { LinkButton } from '../../components/ui/Button.jsx'

const ROWS = [
  ['Invoices', 'Choose a customer, add products with quantities, set a due date and status. Per-line tax and discount are shown as you type. The server calculates the final amounts with the same rounding.'],
  ['PDF downloads', 'Request a PDF and the app shows progress while it is prepared in the background. The file is checked before it is saved.'],
  ['Email delivery', 'Send an invoice to the customer’s address on the invoice. Delivery is queued, and you are told when it finishes or fails.'],
  ['Customers and products', 'Searchable lists with GST numbers, billing and shipping addresses, units, tax rates and discounts. Deletes can be undone for a few seconds.'],
  ['Dashboard', 'Paid revenue by month, paid versus pending, status mix, needs-attention list and your best customers and products.'],
  ['Made to be accessible', 'Keyboard-friendly, screen-reader tested patterns, light and dark themes, reduced-motion support and a compact table density.'],
]

export default function Features() {
  return (
    <PageShell title="Features" description="Invoices, PDFs, email, customers, products and an honest dashboard." path="/features" intro="Everything you need to bill a customer and see what is still unpaid.">
      <dl className="stack-lg">
        {ROWS.map(([t, d]) => (<div key={t} className="stack"><dt style={{ fontFamily: 'var(--ff-heading)', fontSize: 'var(--text-xl)', fontWeight: 650 }}>{t}</dt><dd style={{ margin: 0 }} className="muted">{d}</dd></div>))}
      </dl>
      <div><LinkButton to="/signup" variant="primary" size="lg">Create a free account</LinkButton></div>
    </PageShell>
  )
}
