import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Icon } from './Icon.jsx'
import { cn } from '../../lib/cn.js'

/** Menu button. items: [{label, icon, onSelect, danger, checked, disabled} | {separator:true} | {heading:'x'}] */
export function Menu({ label, icon, items, align = 'end', side, iconOnly = false, caret = true, className, buttonClassName, variant = 'secondary', size }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const list = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    list.current?.querySelector('[role^="menuitem"]:not(:disabled)')?.focus()
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const move = (dir) => {
    const nodes = [...list.current.querySelectorAll('[role^="menuitem"]:not(:disabled)')]
    const i = nodes.indexOf(document.activeElement)
    nodes[(i + dir + nodes.length) % nodes.length]?.focus()
  }
  const onKey = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      root.current?.querySelector('button')?.focus()
    } else if (e.key === 'ArrowDown') (e.preventDefault(), move(1))
    else if (e.key === 'ArrowUp') (e.preventDefault(), move(-1))
    else if (e.key === 'Tab') setOpen(false)
  }

  return (
    <div ref={root} className={cn('menu-root', className)} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className={cn('btn', `btn-${variant}`, buttonClassName)}
        data-size={size}
        data-icon-only={iconOnly ? 'true' : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) (e.preventDefault(), setOpen(true))
        }}
      >
        {icon && <Icon as={icon} />}
        {iconOnly ? <span className="sr-only">{label}</span> : <span className="btn-label">{label}</span>}
        {caret && !iconOnly && <Icon as={ChevronDown} size={16} />}
      </button>
      {open && (
        <div id={id} ref={list} className="menu" role="menu" aria-label={label} data-align={align} data-side={side} onKeyDown={onKey}>
          {items.map((it, i) => {
            if (it.separator) return <div key={i} className="menu-sep" role="separator" />
            if (it.heading) return <div key={i} className="menu-label">{it.heading}</div>
            const checkable = typeof it.checked === 'boolean'
            return (
              <button
                key={it.label}
                type="button"
                role={checkable ? 'menuitemradio' : 'menuitem'}
                aria-checked={checkable ? it.checked : undefined}
                className="menu-item"
                data-danger={it.danger ? 'true' : undefined}
                disabled={it.disabled}
                onClick={() => {
                  setOpen(false)
                  root.current?.querySelector('button')?.focus()
                  it.onSelect?.()
                }}
              >
                {it.icon && <Icon as={it.icon} size={16} />}
                {it.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
