import { useCallback, useEffect, useRef, useState } from 'react'
import { SESSION } from '../config/features.js'

const EVENTS = ['pointerdown', 'keydown', 'scroll', 'visibilitychange']

/**
 * Signs the user out after `idleMinutes` of inactivity, with a `warnSeconds` warning first.
 * Returns { warning, secondsLeft, stay }. Only active while `enabled`.
 */
export function useIdleTimeout({ enabled, onTimeout, idleMinutes = SESSION.idleMinutes, warnSeconds = SESSION.warnSeconds }) {
  const [secondsLeft, setSecondsLeft] = useState(null)
  const last = useRef(Date.now())
  const cb = useRef(onTimeout)
  cb.current = onTimeout
  const warning = secondsLeft !== null
  const warned = useRef(false)
  warned.current = warning

  const stay = useCallback(() => {
    last.current = Date.now()
    setSecondsLeft(null)
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    last.current = Date.now()
    const bump = () => {
      // During the warning only the explicit "Stay signed in" button counts.
      if (document.visibilityState === 'hidden' || warned.current) return
      last.current = Date.now()
    }
    EVENTS.forEach((e) => window.addEventListener(e, bump, { passive: true }))
    const idleMs = idleMinutes * 60000
    const tick = setInterval(() => {
      const idle = Date.now() - last.current
      if (idle >= idleMs + warnSeconds * 1000) {
        clearInterval(tick)
        setSecondsLeft(null)
        cb.current?.()
      } else if (idle >= idleMs) {
        setSecondsLeft(Math.max(0, Math.ceil((idleMs + warnSeconds * 1000 - idle) / 1000)))
      }
    }, 1000)
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, bump))
      clearInterval(tick)
    }
  }, [enabled, idleMinutes, warnSeconds])

  return { warning, secondsLeft: secondsLeft ?? warnSeconds, stay }
}
