import { useCallback, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { PanelLeftClose, PanelLeftOpen, Plus, Search } from 'lucide-react'
import { Logo, LogoMark } from '../components/ui/Logo.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Icon } from '../components/ui/Icon.jsx'
import { APP_NAV } from '../components/layout/nav.js'
import { ThemeMenu } from '../components/layout/ThemeMenu.jsx'
import { Avatar, UserMenu } from '../components/layout/UserMenu.jsx'
import { CommandPalette, IdleDialog, ShortcutsDialog } from '../components/layout/Dialogs.jsx'
import { PolicyNotice } from '../components/layout/Banners.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useHotkeys } from '../hooks/useHotkeys.js'
import { useIdleTimeout } from '../hooks/useIdleTimeout.js'
import { storage } from '../lib/storage.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

import { useNoIndex } from '../hooks/useSeo.js'

export default function AppLayout() {
  useNoIndex()
  const { user, logout, clearSession } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => storage.get('ip.sidebar') === 'collapsed')
  const [palette, setPalette] = useState(false)
  const [help, setHelp] = useState(false)
  const desktop = useMediaQuery('(min-width: 1024px)')

  const idle = useIdleTimeout({
    enabled: true,
    onTimeout: () => {
      logout().then(() => clearSession({ notice: 'You were signed out after a period of inactivity.' }))
    },
  })

  useHotkeys({
    'mod+k': () => setPalette(true),
    '?': () => setHelp(true),
    'g d': () => navigate('/dashboard'),
    'g i': () => navigate('/invoices'),
    'g c': () => navigate('/customers'),
    'g p': () => navigate('/products'),
    n: () => navigate('/invoices/new'),
  })

  const toggle = useCallback(() => {
    setCollapsed((v) => {
      storage.set('ip.sidebar', v ? 'expanded' : 'collapsed')
      return !v
    })
  }, [])

  return (
    <div className="app-shell" data-collapsed={collapsed ? 'true' : undefined}>
      <aside className="sidebar" aria-label="Sidebar">
        <Link to="/dashboard" className="sidebar-brand" aria-label="InvoicePilot dashboard">
          {collapsed ? <LogoMark /> : <Logo />}
        </Link>
        <nav className="sidebar-nav" aria-label="Primary">
          {APP_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="sidebar-link" title={collapsed ? n.label : undefined}>
              <Icon as={n.icon} />
              <span className="sidebar-label">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" size="sm" icon={collapsed ? PanelLeftOpen : PanelLeftClose} onClick={toggle} aria-pressed={collapsed}>
          {collapsed ? 'Expand' : 'Collapse'}
        </Button>
        <div className="sidebar-user">
          <Avatar name={user?.username} />
          <div className="sidebar-user-text">
            <div className="truncate-text" style={{ fontWeight: 600 }}>{user?.username}</div>
            <div className="truncate-text muted">{user?.email}</div>
          </div>
        </div>
      </aside>

      <div style={{ minInlineSize: 0 }}>
        <PolicyNotice />
        <header className="topbar">
          <Link to="/dashboard" className="mobile-only" aria-label="InvoicePilot dashboard" style={{ display: desktop ? 'none' : undefined }}><LogoMark /></Link>
          <button type="button" className="topbar-search" onClick={() => setPalette(true)}>
            <Icon as={Search} size={16} />
            <span style={{ flex: 1, textAlign: 'start' }}>Search or jump to…</span>
            <kbd className="kbd">Ctrl K</kbd>
          </button>
          <span className="topbar-title" />
          <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/invoices/new')} className="hide-sm">New invoice</Button>
          <Button variant="ghost" iconOnly icon={Search} onClick={() => setPalette(true)} className="mobile-only">Open command palette</Button>
          <ThemeMenu showDensity />
          <UserMenu onShortcuts={() => setHelp(true)} />
        </header>
        <main id="main" className="main-area">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary mobile">
        {APP_NAV.slice(0, 2).map((n) => (
          <NavLink key={n.to} to={n.to} className="bottom-link"><Icon as={n.icon} />{n.label}</NavLink>
        ))}
        <Link to="/invoices/new" className="bottom-fab" aria-label="New invoice"><Icon as={Plus} size={24} /></Link>
        {APP_NAV.slice(2, 4).map((n) => (
          <NavLink key={n.to} to={n.to} className="bottom-link"><Icon as={n.icon} />{n.label}</NavLink>
        ))}
      </nav>

      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <ShortcutsDialog open={help} onClose={() => setHelp(false)} />
      <IdleDialog open={idle.warning} secondsLeft={idle.secondsLeft} onStay={idle.stay} onLogout={() => logout()} />
    </div>
  )
}
