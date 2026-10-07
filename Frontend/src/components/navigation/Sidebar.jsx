import { NavLink } from 'react-router-dom';
import Logo from '../common/Logo';
import { cn } from '../../lib/cn';

import { NAV_ITEMS } from './nav-items';

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 shrink-0 items-center border-b border-line px-5">
        <Logo />
      </div>
      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-soft text-brand' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
              )
            }
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
