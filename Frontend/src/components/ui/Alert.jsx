import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { Icon } from './Icon.jsx'
import { cn } from '../../lib/cn.js'

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle }

export function Alert({ tone = 'info', title, children, className, actions, live = true }) {
  return (
    <div className={cn('alert', className)} data-tone={tone} role={live ? (tone === 'danger' ? 'alert' : 'status') : undefined}>
      <Icon as={ICONS[tone]} className="alert-icon" />
      <div className="alert-body">
        {title && <p className="alert-title">{title}</p>}
        {children && <div>{children}</div>}
        {actions && <div style={{ marginBlockStart: 'var(--space-2)' }}>{actions}</div>}
      </div>
    </div>
  )
}
