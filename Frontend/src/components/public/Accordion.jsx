import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Icon } from '../ui/Icon.jsx'

/** items: [{q, a}]. Buttons with aria-expanded; panels animate by grid rows (no layout script). */
export function Accordion({ items }) {
  const base = useId()
  const [open, setOpen] = useState(null)
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it.q} className="accordion-item">
            <h3>
              <button type="button" className="accordion-trigger" aria-expanded={isOpen} aria-controls={`${base}-${i}`} id={`${base}-t-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                {it.q}
                <Icon as={ChevronDown} style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform var(--dur-open) var(--ease)' }} />
              </button>
            </h3>
            <div id={`${base}-${i}`} role="region" aria-labelledby={`${base}-t-${i}`} className="accordion-panel" data-open={isOpen ? 'true' : 'false'} hidden={false} inert={isOpen ? undefined : true}>
              <div><p>{it.a}</p></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
