import { PageShell } from '../../components/public/PageShell.jsx'
import { LinkButton } from '../../components/ui/Button.jsx'
import { Sheet } from '../../components/sheet/index.jsx'

export default function Pricing() {
  return (
    <PageShell title="Pricing" description="InvoicePilot is free to use." path="/pricing" intro="One plan. It costs nothing.">
      <Sheet fold>
        <h2 style={{ fontSize: 'var(--text-xl)' }}>Free</h2>
        <p className="tabular" style={{ fontFamily: 'var(--ff-heading)', fontSize: 'var(--text-3xl)', fontWeight: 700 }}>₹0</p>
        <ul>
          <li>Invoices, customers and products</li>
          <li>PDF downloads and invoice emails (fair-use limits apply)</li>
          <li>Dashboard and reports</li>
        </ul>
        <LinkButton to="/signup" variant="primary">Get started</LinkButton>
      </Sheet>
      <p className="muted">Because there is no charge, there are no refunds to ask for. If pricing ever changes, we will tell you in the app first.</p>
    </PageShell>
  )
}
