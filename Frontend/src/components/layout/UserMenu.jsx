import { useNavigate } from 'react-router'
import { Keyboard, LogOut, UserCog } from 'lucide-react'
import { Menu } from '../ui/Menu.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { initials } from '../../lib/format.js'

export function Avatar({ name }) {
  return <span className="avatar" aria-hidden="true">{initials(name)}</span>
}

export function UserMenu({ onShortcuts }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Menu
      label={`Account menu for ${user?.username || 'you'}`}
      iconOnly
      caret={false}
      variant="ghost"
      icon={UserCog}
      items={[
        { heading: user?.email || '' },
        { label: 'Account settings', icon: UserCog, onSelect: () => navigate('/account') },
        { label: 'Keyboard shortcuts', icon: Keyboard, onSelect: onShortcuts },
        { separator: true },
        { label: 'Sign out', icon: LogOut, danger: true, onSelect: () => logout() },
      ]}
    />
  )
}
