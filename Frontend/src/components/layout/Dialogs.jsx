import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { APP_NAV, SHORTCUTS } from './nav.js'
import { FilePlus2, Search } from 'lucide-react'

export function ShortcutsDialog({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header title="Keyboard shortcuts" description="Single-key shortcuts are ignored while you type in a field." />
      <Modal.Body>
        <ul className="shortcut-list">
          {SHORTCUTS.map((s) => (
            <li key={s.label}>
              <span>{s.label}</span>
              <span>
                {s.keys.map((k, i) => (
                  <span key={k}>
                    <kbd className="kbd">{k}</kbd>
                    {i < s.keys.length - 1 && <span className="muted"> then </span>}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button data-autofocus onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export function IdleDialog({ open, secondsLeft, onStay, onLogout }) {
  return (
    <Modal open={open} onClose={onStay} dismissible={false} size="sm">
      <Modal.Header title="Still there?" description="You have been inactive for a while." />
      <Modal.Body>
        <p role="timer" aria-live="off">
          For your security you will be signed out in <strong className="tabular">{secondsLeft}</strong> seconds.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onLogout}>Sign out now</Button>
        <Button variant="primary" data-autofocus onClick={onStay}>Stay signed in</Button>
      </Modal.Footer>
    </Modal>
  )
}

/** Ctrl/⌘+K palette: jump to a page or start an action. Listbox pattern with aria-activedescendant. */
export function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [index, setIndex] = useState(0)
  const input = useRef(null)
  const commands = useMemo(
    () => [
      { id: 'new', label: 'New invoice', icon: FilePlus2, run: () => navigate('/invoices/new') },
      ...APP_NAV.map((n) => ({ id: n.to, label: `Go to ${n.label}`, icon: n.icon, run: () => navigate(n.to) })),
    ],
    [navigate],
  )
  const results = commands.filter((c) => c.label.toLowerCase().includes(q.trim().toLowerCase()))
  useEffect(() => {
    if (open) {
      setQ('')
      setIndex(0)
    }
  }, [open])
  const run = (c) => {
    onClose()
    c?.run()
  }
  const onKey = (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setIndex((i) => Math.min(i + 1, results.length - 1)))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setIndex((i) => Math.max(i - 1, 0)))
    else if (e.key === 'Enter') (e.preventDefault(), run(results[index]))
  }
  return (
    <Modal open={open} onClose={onClose} size="sm" initialFocus="input">
      <Modal.Header title="Command palette" description="Type to filter, use the arrow keys, press Enter to run." />
      <Modal.Body>
        <div className="input-affix">
          <Icon as={Search} style={{ position: 'absolute', insetInlineStart: 12, insetBlockStart: 14 }} />
          <input
            ref={input}
            className="input"
            style={{ paddingInlineStart: 40 }}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[index] ? `pal-${results[index].id}` : undefined}
            aria-label="Search commands"
            value={q}
            onChange={(e) => (setQ(e.target.value), setIndex(0))}
            onKeyDown={onKey}
            autoComplete="off"
          />
        </div>
        <ul id="palette-list" className="palette-list" role="listbox" aria-label="Commands">
          {results.map((c, i) => (
            <li key={c.id} id={`pal-${c.id}`} role="option" aria-selected={i === index} className="palette-item" onMouseEnter={() => setIndex(i)} onClick={() => run(c)}>
              <Icon as={c.icon} />
              {c.label}
            </li>
          ))}
          {!results.length && <li className="muted" role="presentation" style={{ padding: 12 }}>No matching commands.</li>}
        </ul>
      </Modal.Body>
    </Modal>
  )
}
