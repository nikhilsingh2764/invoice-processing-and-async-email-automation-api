import { Link, NavLink } from 'react-router'
import { Menu as MenuIcon } from 'lucide-react'
import { Logo } from '../ui/Logo.jsx'
import { LinkButton } from '../ui/Button.jsx'
import { Menu } from '../ui/Menu.jsx'
import { ThemeMenu } from './ThemeMenu.jsx'
import { PUBLIC_NAV } from './nav.js'
import { useHealth } from '../../hooks/queries.js'
import { SITE } from '../../config/site.js'
import { useNavigate } from 'react-router'

/** Small live indicator fed by /health. Text and shape carry the state, not colour alone. */
export function StatusDot() {
  const { data, isError } = useHealth()
  const state = isError ? 'unknown' : data ? (data.ok ? 'up' : 'down') : 'unknown'
  const text = { up: 'All systems operational', down: 'Service degraded', unknown: 'Status unknown' }[state]
  return (
    <Link to="/status" className="status-row" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
      <span className="status-dot" data-state={state === 'unknown' ? undefined : state} aria-hidden="true" />
      {text}
    </Link>
  )
}

export function SiteHeader() {
  const navigate = useNavigate()
  return (
    <header className="site-header">
      <div className="container-page site-header-inner">
        <Link to="/" className="brand-link" aria-label="InvoicePilot home"><Logo /></Link>
        <nav className="site-nav" aria-label="Main">
          {PUBLIC_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="site-link">{n.label}</NavLink>
          ))}
        </nav>
        <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeMenu />
          <LinkButton to="/login" variant="ghost" className="hide-sm">Sign in</LinkButton>
          <LinkButton to="/signup" variant="primary">Get started</LinkButton>
          <span className="mobile-only">
            <Menu label="Menu" icon={MenuIcon} iconOnly caret={false} variant="ghost" items={[...PUBLIC_NAV.map((n) => ({ label: n.label, onSelect: () => navigate(n.to) })), { separator: true }, { label: 'Sign in', onSelect: () => navigate('/login') }]} />
          </span>
        </div>
      </div>
    </header>
  )
}

const LEGAL = [
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
  ['/cookies', 'Storage policy'],
  ['/data-rights', 'Your data rights'],
  ['/grievance', 'Grievance Officer'],
]

export function SiteFooter() {
  return (
    <footer style={{ borderBlockStart: '1px solid var(--hairline)', background: 'var(--sunken)', marginBlockStart: 'var(--space-20)' }}>
      <div className="container-page" style={{ paddingBlock: 'var(--space-12)', display: 'grid', gap: 'var(--space-8)' }}>
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="muted" style={{ marginBlockStart: 12, maxInlineSize: '22rem', fontSize: 'var(--text-sm)' }}>{SITE.tagline}</p>
          </div>
          <div>
            <h2 className="footer-title">Product</h2>
            {PUBLIC_NAV.map((n) => <Link key={n.to} to={n.to} className="footer-link">{n.label}</Link>)}
            <Link to="/security" className="footer-link">Security</Link>
          </div>
          <div>
            <h2 className="footer-title">Legal</h2>
            {LEGAL.map(([to, label]) => <Link key={to} to={to} className="footer-link">{label}</Link>)}
          </div>
          <div>
            <h2 className="footer-title">Company</h2>
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/accessibility" className="footer-link">Accessibility</Link>
            <a className="footer-link" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>© {new Date().getFullYear()} {SITE.companyName}</p>
          <StatusDot />
        </div>
      </div>
    </footer>
  )
}
