import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { Icon } from './Icon.jsx'
import { Button } from './Button.jsx'

const ToastCtx = createContext(null)
const ICON = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }
let seq = 0

function ToastItem({ t, onDone }) {
  const [paused, setPaused] = useState(false)
  const left = useRef(t.duration)
  const started = useRef(Date.now())
  useEffect(() => {
    if (paused || !t.duration) return undefined
    started.current = Date.now()
    const timer = setTimeout(() => onDone(t.id, 'timeout'), left.current)
    return () => {
      clearTimeout(timer)
      left.current -= Date.now() - started.current
    }
  }, [paused, t.duration, t.id, onDone])
  const Glyph = ICON[t.type] || Info
  return (
    <div
      className="toast"
      data-type={t.type}
      data-paused={paused ? 'true' : undefined}
      style={{ '--toast-ms': `${t.duration}ms` }}
      role={t.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon as={Glyph} className="toast-icon" />
      <div className="toast-body">
        <p className="toast-title">{t.title}</p>
        {t.description && <p>{t.description}</p>}
      </div>
      {t.action && (
        <Button size="sm" variant="ghost" onClick={() => onDone(t.id, 'action', t.action.onClick)}>
          {t.action.label}
        </Button>
      )}
      <Button size="sm" variant="ghost" iconOnly icon={X} onClick={() => onDone(t.id, 'dismiss')}>
        Dismiss notification
      </Button>
      {t.duration > 0 && <span className="toast-bar" aria-hidden="true" />}
    </div>
  )
}

/** Toasts pause on hover/focus. `undoable` is the Command pattern: the action is only committed when the toast times out. */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const pending = useRef(new Map())

  const done = useCallback((id, reason, cb) => {
    setItems((all) => all.filter((x) => x.id !== id))
    const entry = pending.current.get(id)
    if (entry) {
      pending.current.delete(id)
      if (reason === 'action') entry.undo?.()
      else entry.commit?.()
    }
    if (reason === 'action') cb?.()
  }, [])

  const push = useCallback((t) => {
    seq += 1
    const id = seq
    setItems((all) => [...all.slice(-3), { id, type: 'info', duration: 5000, ...t }])
    return id
  }, [])

  const api = useMemo(
    () => ({
      push,
      success: (title, description) => push({ type: 'success', title, description }),
      error: (title, description) => push({ type: 'error', title, description, duration: 8000 }),
      info: (title, description) => push({ type: 'info', title, description }),
      warning: (title, description) => push({ type: 'warning', title, description, duration: 8000 }),
      /** Shows an Undo toast. `commit` runs when it expires or is dismissed; `undo` runs when Undo is pressed. */
      undoable: (title, { commit, undo, duration = 6000 }) => {
        const id = push({ type: 'success', title, duration, action: { label: 'Undo' } })
        pending.current.set(id, { commit, undo })
        return id
      },
    }),
    [push],
  )

  // Commit anything still pending if the page goes away.
  useEffect(() => {
    const map = pending.current
    const flush = () => map.forEach((e) => e.commit?.())
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-region" aria-label="Notifications" role="region">
        {items.map((t) => (
          <ToastItem key={t.id} t={t} onDone={done} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
