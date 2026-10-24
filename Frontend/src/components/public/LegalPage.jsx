import { Link } from 'react-router'
import { Printer } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { Alert } from '../ui/Alert.jsx'
import { useSeo } from '../../hooks/useSeo.js'
import { SITE } from '../../config/site.js'
import { formatDate } from '../../lib/format.js'

/** Legal page shell: last-updated date, desktop table of contents, print button, lawyer-review notice. */
export function LegalPage({ title, description, path, sections, intro }) {
  useSeo({ title, description, path })
  return (
    <div className="container-page" style={{ paddingBlock: 'var(--space-12)' }}>
      <div style={{ display: 'grid', gap: 'var(--space-8)', gridTemplateColumns: 'minmax(0, 1fr)' }} className="legal-grid">
        <nav className="toc" aria-label="On this page">
          <p className="footer-title">On this page</p>
          {sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}
        </nav>
        <article className="prose" style={{ maxInlineSize: 'var(--reading-max)' }}>
          <h1 id="page-title" tabIndex={-1}>{title}</h1>
          <p className="muted">Last updated {formatDate(SITE.lastUpdated)} · Effective {formatDate(SITE.effectiveDate)}</p>
          <p className="no-print"><Button size="sm" icon={Printer} onClick={() => window.print()}>Print this page</Button></p>
          <Alert tone="warning" className="no-print">Template text. A qualified lawyer must review this page and the placeholders in <code>src/config/site.js</code> before launch.</Alert>
          {intro}
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2 id={s.id}>{s.title}</h2>
              {s.body}
            </section>
          ))}
          <p className="muted">Questions? Email <a href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</a> or see the <Link to="/grievance">Grievance Officer</Link> page.</p>
        </article>
      </div>
    </div>
  )
}
