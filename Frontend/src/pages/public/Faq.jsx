import { Accordion } from '../../components/public/Accordion.jsx'
import { useSeo } from '../../hooks/useSeo.js'

export const FAQ = [
  { q: 'Is InvoicePilot really free?', a: 'Yes. There is no paid plan, so there is nothing to refund.' },
  { q: 'Can I use it for GST invoices?', a: 'You can store GST numbers for your business and customers and apply a tax rate per product. Check the result with your accountant, because we do not give tax advice.' },
  { q: 'Why does the PDF take a moment?', a: 'PDFs are prepared in the background so the app stays fast. The button shows progress and downloads the file when it is ready.' },
  { q: 'Did my invoice email arrive?', a: 'Emails are queued and sent in the background. You get a notice once the job completes or fails. Check the customer’s address first if it fails.' },
  { q: 'Why do dashboard totals lag?', a: 'The server caches dashboard numbers for up to 10 minutes after a change. Individual invoices are always current.' },
  { q: 'Why is my first invoice number not the start number?', a: 'The server counts up before it uses a number, so the first invoice is the start number plus one.' },
  { q: 'I forgot my password.', a: 'Use “Forgot password” on the sign-in page. We send a 6-digit code to the email on the account.' },
  { q: 'I signed in with Google. Can I set a password?', a: 'Google accounts do not use a password here, so password change and reset are not available. Manage security in your Google account.' },
  { q: 'How do I delete my account?', a: 'Open Account and choose Delete account. See Your data rights for details, including Google accounts.' },
  { q: 'Which browsers work?', a: 'Current Chrome, Edge, Firefox and Safari. Older browsers get a simplified layout.' },
]

export default function Faq() {
  useSeo({
    title: 'FAQ',
    description: 'Answers about invoices, PDFs, emails, GST fields, accounts and data.',
    path: '/faq',
    jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  })
  return (
    <div className="container-page" style={{ paddingBlock: 'var(--space-12)', maxInlineSize: '52rem' }}>
      <h1 id="page-title" tabIndex={-1}>Frequently asked questions</h1>
      <Accordion items={FAQ} />
    </div>
  )
}
