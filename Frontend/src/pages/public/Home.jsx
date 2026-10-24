import { Link } from 'react-router'
import { Download, FileText, Mail, ShieldCheck, Users, Zap } from 'lucide-react'
import HeroInvoice from '../../components/public/HeroInvoice.jsx'
import { Accordion } from '../../components/public/Accordion.jsx'
import { LinkButton } from '../../components/ui/Button.jsx'
import { Icon } from '../../components/ui/Icon.jsx'
import { MetaStrip, MetaCell, Sheet } from '../../components/sheet/index.jsx'
import { useReveal } from '../../hooks/useReveal.js'
import { useSeo } from '../../hooks/useSeo.js'
import { SITE } from '../../config/site.js'
import { FAQ } from './Faq.jsx'

const FEATURES = [
  { icon: FileText, title: 'Invoices that add up', text: 'Pick a customer and products. Tax, discount and totals are calculated the same way on screen and on the server.' },
  { icon: Download, title: 'PDF in the background', text: 'Ask for a PDF and keep working. It is prepared in the background and downloads when ready.' },
  { icon: Mail, title: 'Email to your customer', text: 'Send the invoice by email with one click. Delivery is queued, so a slow mail server never blocks you.' },
  { icon: Users, title: 'Customers and products', text: 'Keep a tidy list of who you bill and what you sell, with GST numbers and addresses.' },
  { icon: Zap, title: 'A dashboard that is honest', text: 'Paid revenue, what is pending, what is overdue, with notes on exactly how each number is counted.' },
  { icon: ShieldCheck, title: 'Careful with sign-in', text: 'Sessions live in HttpOnly cookies. Passwords are never stored in your browser.' },
]
const STEPS = [['Business', 'Add your details and invoice prefix.'], ['Customer', 'Add who you are billing.'], ['Invoice', 'Choose items and a due date.'], ['Send', 'Email it or download the PDF.']]

function Reveal({ children, i = 0, as: Tag = 'div', ...rest }) {
  const ref = useReveal()
  return <Tag ref={ref} className="reveal" style={{ '--i': i }} {...rest}>{children}</Tag>
}

export default function Home() {
  useSeo({
    description: 'Create invoices, email them to customers and download PDFs. InvoicePilot is free to use.',
    path: '/',
    jsonLd: { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: SITE.name, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' } },
  })
  return (
    <>
      <section className="container-page" style={{ paddingBlock: 'var(--space-16) var(--space-12)', display: 'grid', gap: 'var(--space-12)', alignItems: 'center' }}>
        <div className="feature-row">
          <div className="stack">
            <h1 id="page-title" tabIndex={-1}>Send the invoice. Get it paid.</h1>
            <p className="muted" style={{ fontSize: 'var(--text-lg)', maxInlineSize: '34rem' }}>{SITE.tagline} Built for freelancers and small businesses in India, with GST fields included. Free to use.</p>
            <div className="cluster">
              <LinkButton to="/signup" variant="primary" size="lg">Create a free account</LinkButton>
              <LinkButton to="/features" size="lg">See features</LinkButton>
            </div>
          </div>
          <HeroInvoice />
        </div>
      </section>

      <section className="container-page" aria-label="At a glance" style={{ paddingBlock: 'var(--space-6)' }}>
        <Sheet>
          <MetaStrip label="At a glance">
            <MetaCell label="Price" value="Free" />
            <MetaCell label="Sign-in" value="HttpOnly cookies" />
            <MetaCell label="PDFs and email" value="Background jobs" />
            <MetaCell label="Tax" value="GST-ready" />
          </MetaStrip>
        </Sheet>
      </section>

      <section className="container-page" aria-labelledby="feat-h" style={{ paddingBlockStart: 'var(--space-16)' }}>
        <h2 id="feat-h">Everything between “new invoice” and “paid”</h2>
        <div className="grid-cards" style={{ marginBlockStart: 'var(--space-6)' }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} i={i % 3} as="article">
              <div className="card" style={{ blockSize: '100%' }}>
                <Icon as={f.icon} size={24} />
                <h3 style={{ marginBlock: '8px 4px', fontSize: 'var(--text-lg)' }}>{f.title}</h3>
                <p className="muted">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page" aria-labelledby="how-h" style={{ paddingBlockStart: 'var(--space-16)' }}>
        <h2 id="how-h">How it works</h2>
        <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', marginBlockStart: 'var(--space-6)' }}>
          {STEPS.map(([t, d], i) => (
            <li key={t} className="card"><span className="zone-number" aria-hidden="true">{i + 1}</span><h3 style={{ marginBlock: '12px 4px', fontSize: 'var(--text-lg)' }}>{t}</h3><p className="muted">{d}</p></li>
          ))}
        </ol>
      </section>

      <section className="container-page" aria-labelledby="faq-h" style={{ paddingBlockStart: 'var(--space-16)', maxInlineSize: '52rem' }}>
        <h2 id="faq-h">Questions</h2>
        <Accordion items={FAQ.slice(0, 5)} />
        <p style={{ marginBlockStart: 12 }}><Link to="/faq">See all questions</Link></p>
      </section>

      <section className="container-page" style={{ paddingBlockStart: 'var(--space-16)' }}>
        <Sheet stack style={{ textAlign: 'center' }}>
          <h2>Create your first invoice in a few minutes</h2>
          <p className="muted" style={{ marginBlock: '8px 16px' }}>No card needed. Free to use.</p>
          <LinkButton to="/signup" variant="primary" size="lg">Get started</LinkButton>
        </Sheet>
      </section>
    </>
  )
}
