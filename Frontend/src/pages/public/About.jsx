import { PageShell } from '../../components/public/PageShell.jsx'
import { ExternalLink } from '../../components/ui/ExternalLink.jsx'
import { SITE } from '../../config/site.js'

export default function About() {
  return (
    <PageShell title="About" description="Why InvoicePilot exists and who runs it." path="/about" intro="InvoicePilot is a focused invoicing tool for freelancers and small businesses.">
      <p>It does a few things and tries to do them honestly: create an invoice, send it, download it, and show what has been paid. PDFs and emails run as background jobs so the app stays quick.</p>
      <p>It is run by {SITE.companyName}. Source code and API documentation are on <ExternalLink href={SITE.githubUrl}>GitHub</ExternalLink>.</p>
    </PageShell>
  )
}
