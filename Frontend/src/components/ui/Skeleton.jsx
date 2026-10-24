import { cn } from '../../lib/cn.js'

export const Skeleton = ({ className, style }) => <span className={cn('skeleton', className)} style={style} aria-hidden="true" />

/** Same row height as the real ledger so nothing jumps when data lands. */
export function LedgerSkeleton({ rows = 6, label = 'Loading' }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-row" aria-hidden="true">
          <Skeleton style={{ inlineSize: '100%', blockSize: 16 }} />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ height = 180, label = 'Loading' }) {
  return (
    <div className="card" role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <Skeleton style={{ inlineSize: '40%', blockSize: 18 }} />
      <Skeleton style={{ inlineSize: '100%', blockSize: height, marginBlockStart: 16 }} />
    </div>
  )
}
