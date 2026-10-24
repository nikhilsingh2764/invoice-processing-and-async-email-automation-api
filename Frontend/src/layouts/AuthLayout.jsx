import { Link, Outlet } from 'react-router'
import { Logo } from '../components/ui/Logo.jsx'
import { ThemeMenu } from '../components/layout/ThemeMenu.jsx'
import { Stamp, Perforation } from '../components/sheet/index.jsx'

import { useNoIndex } from '../hooks/useSeo.js'

export default function AuthLayout() {
  useNoIndex()
  return (
    <div className="auth-split">
      <aside className="auth-brand" aria-hidden="true">
        <Link to="/" tabIndex={-1}><Logo size={32} /></Link>
        <div style={{ display: 'grid', gap: 16, maxInlineSize: '24rem' }}>
          <p style={{ fontFamily: 'var(--ff-heading)', fontSize: 'var(--fluid-h2)', fontWeight: 650, lineHeight: 1.15 }}>Send the invoice. Get it paid. Keep the paperwork tidy.</p>
          <Perforation />
          <div><Stamp status="Paid" /></div>
        </div>
        <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>PDFs and emails are prepared in the background, so you can keep working.</p>
      </aside>
      <main id="main" className="auth-main">
        <div style={{ position: 'absolute', insetBlockStart: 12, insetInlineEnd: 12 }}><ThemeMenu /></div>
        <div className="auth-card">
          <Link to="/" className="mobile-only" aria-label="InvoicePilot home"><Logo /></Link>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
