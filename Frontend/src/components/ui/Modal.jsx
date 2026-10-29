import { createContext, useContext, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from './Button.jsx'
import { Icon } from './Icon.jsx'

const ModalCtx = createContext(null)
const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
let openCount = 0

/** Compound dialog: <Modal open onClose size><Modal.Header title description/><Modal.Body/><Modal.Footer/></Modal>
 *  Focus is trapped, Escape closes, focus returns to the opener, and the page behind cannot scroll. */
export function Modal({ open, onClose, size = 'md', children, dismissible = true, initialFocus }) {
  const ref = useRef(null)
  const titleId = useId()
  const descId = useId()
  const opener = useRef(null)
  // Keep the latest onClose in a ref: callers pass a new function every render, and listing it as an effect
  // dependency re-ran the effect (moving focus back to the first field) whenever the parent re-rendered.
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    opener.current = document.activeElement
    openCount += 1
    document.body.style.overflow = 'hidden'
    const node = ref.current
    const target = (initialFocus && node?.querySelector(initialFocus)) || node?.querySelector('[data-autofocus]') || node?.querySelector(FOCUSABLE) || node
    target?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation()
        closeRef.current?.()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (!items.length) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      openCount -= 1
      if (openCount <= 0) document.body.style.overflow = ''
      const el = opener.current
      if (el && typeof el.focus === 'function' && document.contains(el)) el.focus()
    }
  }, [open, dismissible, initialFocus])

  if (!open) return null
  return createPortal(
    <ModalCtx.Provider value={{ titleId, descId, onClose, dismissible }}>
      <div
        className="modal-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && dismissible) onClose?.()
        }}
      >
        <div ref={ref} className="modal" data-size={size === 'md' ? undefined : size} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} tabIndex={-1}>
          <div className="modal-handle" aria-hidden="true" />
          {children}
        </div>
      </div>
    </ModalCtx.Provider>,
    document.body,
  )
}

function Header({ title, description }) {
  const { titleId, descId, onClose, dismissible } = useContext(ModalCtx)
  return (
    <div className="modal-header">
      <div>
        <h2 className="modal-title" id={titleId}>
          {title}
        </h2>
        <p className={description ? 'modal-desc' : 'sr-only'} id={descId}>
          {description || title}
        </p>
      </div>
      {dismissible && (
        <Button variant="ghost" size="sm" iconOnly icon={X} onClick={onClose}>
          Close dialog
        </Button>
      )}
    </div>
  )
}
const Body = ({ children, ...p }) => (
  <div className="modal-body" {...p}>
    {children}
  </div>
)
const Footer = ({ children }) => <div className="modal-footer">{children}</div>
Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer

/** Destructive actions state exactly what is lost. Cancel is focused first. */
export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = 'Delete', loading = false, tone = 'danger' }) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} size="sm" dismissible={!loading}>
      <Modal.Header title={title} />
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button data-autofocus onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export { Icon }
