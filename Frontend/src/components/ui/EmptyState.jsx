import { RefreshCw } from 'lucide-react'
import { Button } from './Button.jsx'

/** Paper illustration: a blank sheet with a folded corner. Decorative. */
export function PaperIllustration() {
  return (
    <svg className="paper-illustration" viewBox="0 0 96 112" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 8h50l22 22v74a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" fill="var(--surface)" stroke="var(--rule-strong)" strokeWidth="2" />
      <path d="M62 8v18a4 4 0 0 0 4 4h18" stroke="var(--rule-strong)" strokeWidth="2" />
      <path d="M22 50h52M22 64h52M22 78h30" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" />
      <circle cx="74" cy="88" r="12" fill="var(--brand)" />
      <path d="M69 88h10M74 83v10" stroke="var(--on-brand)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <PaperIllustration />
      <h3 className="empty-title">{title}</h3>
      {children && <p className="empty-text">{children}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, requestId, children }) {
  return (
    <div className="error-state" role="alert">
      <h3 className="error-state-title">{title}</h3>
      {message && <p>{message}</p>}
      {children}
      {requestId && <p className="muted tabular">Reference: {requestId}</p>}
      {onRetry && (
        <Button icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
