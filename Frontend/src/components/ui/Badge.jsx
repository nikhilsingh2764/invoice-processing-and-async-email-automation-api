import { cn } from '../../lib/cn.js'

export function Badge({ tone, children, className }) {
  return (
    <span className={cn('badge', className)} data-tone={tone}>
      {children}
    </span>
  )
}

/** Status is always text plus a dot, never colour alone. */
export function StatusBadge({ status }) {
  return (
    <span className="badge" data-status={status}>
      <span className="badge-dot" aria-hidden="true" />
      {status}
    </span>
  )
}
