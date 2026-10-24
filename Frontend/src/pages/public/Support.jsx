import { useState } from 'react'
import { Link } from 'react-router'
import { Copy, Mail } from 'lucide-react'
import { PageShell } from '../../components/public/PageShell.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { SITE } from '../../config/site.js'
import { useToast } from '../../components/ui/Toast.jsx'

const GUIDES = [
  ['Create your first invoice', 'Open Business and fill in your details. Add a customer and a product. Choose New invoice, pick them, set a due date and create it.'],
  ['Send or download', 'Open the invoice. Use Email to customer to queue the email, or Download PDF. PDFs can take a few seconds.'],
  ['Fix a wrong invoice', 'Open the invoice and choose Edit. Totals are recalculated by the server when items change.'],
  ['Change a status', 'On an invoice, use Mark as paid or the status list in More actions.'],
]

/** There is no contact API, so this page never fakes a form: it offers mailto, copy and self-service help. */
export default function Support() {
  const toast = useToast()
  const [subject] = useState('InvoicePilot support')
  const mail = `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(subject)}`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.supportEmail)
      toast.success('Email address copied')
    } catch {
      toast.error('Could not copy', 'Select the address and copy it manually.')
    }
  }
  return (
    <PageShell title="Support" description="Get help with InvoicePilot: guides, FAQ and how to email us." path="/support" intro="Most answers are below. If not, email us. Never include your password.">
      <section className="stack" aria-labelledby="mail-h">
        <h2 id="mail-h">Email us</h2>
        <p>{SITE.supportEmail}</p>
        <div className="cluster"><a className="btn btn-primary" href={mail}><Mail width={18} height={18} aria-hidden="true" /><span className="btn-label">Write an email</span></a><Button icon={Copy} onClick={copy}>Copy address</Button></div>
        <p className="muted">Tell us your account email, what you expected and what happened.</p>
      </section>
      <section className="stack" aria-labelledby="guides-h">
        <h2 id="guides-h">Quick guides</h2>
        {GUIDES.map(([t, d]) => <div key={t}><h3>{t}</h3><p className="muted">{d}</p></div>)}
        <p>More in the <Link to="/faq">FAQ</Link>.</p>
      </section>
      <section className="stack" aria-labelledby="g-h">
        <h2 id="g-h">Complaints</h2>
        <p>For a formal complaint, contact the <Link to="/grievance">Grievance Officer</Link>.</p>
      </section>
    </PageShell>
  )
}
