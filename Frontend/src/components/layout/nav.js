import { Boxes, Building2, FileText, LayoutDashboard, UserCog, Users } from 'lucide-react'

export const APP_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/business', label: 'Business', icon: Building2 },
  { to: '/account', label: 'Account', icon: UserCog },
]

export const PUBLIC_NAV = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/support', label: 'Support' },
  { to: '/status', label: 'Status' },
]

export const SHORTCUTS = [
  { keys: ['Ctrl/⌘', 'K'], label: 'Open the command palette' },
  { keys: ['?'], label: 'Show keyboard shortcuts' },
  { keys: ['g', 'd'], label: 'Go to Dashboard' },
  { keys: ['g', 'i'], label: 'Go to Invoices' },
  { keys: ['g', 'c'], label: 'Go to Customers' },
  { keys: ['g', 'p'], label: 'Go to Products' },
  { keys: ['n'], label: 'New invoice' },
  { keys: ['Esc'], label: 'Close dialogs and menus' },
]
