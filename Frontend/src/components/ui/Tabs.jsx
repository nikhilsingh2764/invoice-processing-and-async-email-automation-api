import { useId, useRef } from 'react'

/** tabs: [{id,label,count?}]. Arrow keys / Home / End move focus and selection. Panels are the caller's. */
export function Tabs({ tabs, value, onChange, label, idPrefix, controls = true }) {
  const auto = useId()
  const prefix = idPrefix || auto
  const list = useRef(null)
  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.id === value)
    let n = i
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = tabs.length - 1
    else return
    e.preventDefault()
    onChange(tabs[n].id)
    list.current?.querySelectorAll('[role="tab"]')[n]?.focus()
  }
  return (
    <div ref={list} className="tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
      {tabs.map((t) => (
        <button key={t.id} id={`${prefix}-tab-${t.id}`} type="button" role="tab" className="tab" aria-selected={value === t.id} aria-controls={controls ? `${prefix}-panel-${t.id}` : undefined} tabIndex={value === t.id ? 0 : -1} onClick={() => onChange(t.id)}>
          {t.label}
          {typeof t.count === 'number' && <span className="muted tabular"> {t.count}</span>}
        </button>
      ))}
    </div>
  )
}
export const tabIds = (prefix, id) => ({ id: `${prefix}-panel-${id}`, role: 'tabpanel', 'aria-labelledby': `${prefix}-tab-${id}`, tabIndex: 0 })
