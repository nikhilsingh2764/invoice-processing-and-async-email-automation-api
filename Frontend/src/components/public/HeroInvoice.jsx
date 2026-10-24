import { useEffect, useState } from 'react'
import { Sheet, MetaStrip, MetaCell, Stamp } from '../sheet/index.jsx'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import { formatMoney } from '../../lib/format.js'

const LINES = [
  { name: 'Brand identity design', qty: 1, amount: 24000 },
  { name: 'Landing page build', qty: 1, amount: 36000 },
  { name: 'Monthly maintenance', qty: 3, amount: 9000 },
]
const TOTAL = LINES.reduce((s, l) => s + l.amount, 0)
const STAMPS = ['Draft', 'Sent', 'Paid']

/** Sample invoice that fills in, counts up and settles to Paid. This is the page's one memorable moment. */
export default function HeroInvoice() {
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(reduced ? LINES.length + 3 : 0)
  useEffect(() => {
    if (reduced) {
      setStep(LINES.length + 3)
      return undefined
    }
    const timers = Array.from({ length: LINES.length + 3 }, (_, i) => setTimeout(() => setStep(i + 1), 500 + i * 650))
    return () => timers.forEach(clearTimeout)
  }, [reduced])
  const shown = step > LINES.length ? TOTAL : 0
  const total = useCountUp(shown, { duration: 800 })
  const stamp = step > LINES.length + 2 ? 'Paid' : step > LINES.length + 1 ? 'Sent' : step > LINES.length ? 'Draft' : null

  return (
    <div className="hero-invoice" role="img" aria-label="Sample invoice: three line items totalling ₹69,000, moving from Draft to Sent to Paid">
      <Sheet fold a4 aria-hidden="true">
        <div className="stack">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontFamily: 'var(--ff-heading)', fontSize: 'var(--text-lg)' }}>Studio Meridian</strong>
            <span style={{ minInlineSize: 72, minBlockSize: 34, display: 'inline-grid', justifyItems: 'end' }}>{stamp && <Stamp key={stamp} status={stamp} animate />}</span>
          </div>
          <MetaStrip>
            <MetaCell label="Invoice" value="INV-1042" />
            <MetaCell label="Due" value="30 days" />
          </MetaStrip>
          <div>
            {LINES.map((l, i) => (
              <div key={l.name} className="totals-row" style={{ paddingBlock: 8, borderBlockEnd: '1px solid var(--rule)', opacity: step > i ? 1 : 0.15, transition: 'opacity var(--dur-page) var(--ease)' }}>
                <span>{l.name}</span><span className="leader" aria-hidden="true" /><span className="totals-value">{formatMoney(l.amount, 'INR')}</span>
              </div>
            ))}
          </div>
          <div className="totals-grand"><span>Total</span><span className="leader" aria-hidden="true" /><span className="totals-value">{formatMoney(Math.round(total), 'INR')}</span></div>
          <span className="sr-only">{STAMPS.join(', ')}</span>
        </div>
      </Sheet>
    </div>
  )
}
