import { ExternalLink as ExtIcon } from 'lucide-react'
import { safeUrl } from '../../lib/security.js'
import { Icon } from './Icon.jsx'

/** Every outbound link goes through safeUrl and opens with noopener noreferrer. A bad URL renders as text. */
export function ExternalLink({ href, children, className, showIcon = true }) {
  const safe = safeUrl(href)
  if (!safe) return <span className={className}>{children}</span>
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      {showIcon && <Icon as={ExtIcon} size={14} style={{ marginInlineStart: 4, verticalAlign: '-2px' }} />}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
