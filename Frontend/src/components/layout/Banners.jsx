import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { WifiOff, X } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { Icon } from '../ui/Icon.jsx'
import { useOnline } from '../../hooks/useOnline.js'
import { storage } from '../../lib/storage.js'
import { POLICY_VERSION } from '../../config/features.js'
import { IS_MOCK } from '../../config/env.js'

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className="banner" role="status">
      <Icon as={WifiOff} />
      <span className="banner-grow">You are offline. Changes will not save until you reconnect. Pages you already opened stay readable.</span>
    </div>
  )
}

export function LegacyBanner() {
  return (
    <div className="banner legacy-banner" role="status">
      <span className="banner-grow">Your browser is out of date, so some layouts are simplified. Update it for the best experience.</span>
    </div>
  )
}

export function MockBanner() {
  if (!IS_MOCK) return null
  return (
    <div className="banner" data-tone="info" role="status">
      <span className="banner-grow">Demo mode: you are talking to the local mock API. Nothing here is real data.</span>
    </div>
  )
}

/** Storage notice. We only store preferences; there is nothing to opt out of, so this is an acknowledgement. */
export function CookieBanner() {
  const [seen, setSeen] = useState(() => storage.get('ip.notice.storage') === 'ack')
  if (seen) return null
  return (
    <div className="cookie-bar" role="region" aria-label="Storage notice">
      <p style={{ fontSize: 'var(--text-sm)' }}>
        InvoicePilot signs you in with secure cookies and keeps a few preferences (theme, table density) in your browser. No advertising or tracking cookies are used.{' '}
        <Link to="/cookies">Read the storage policy</Link>.
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          storage.set('ip.notice.storage', 'ack')
          setSeen(true)
        }}
      >
        Got it
      </Button>
    </div>
  )
}

/** Shown once per policy version to people who have been here before. First visits are recorded silently. */
export function PolicyNotice() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const stored = storage.get('ip.notice.policies')
    if (!stored) storage.set('ip.notice.policies', POLICY_VERSION)
    else if (stored !== POLICY_VERSION) setShow(true)
  }, [])
  if (!show) return null
  return (
    <div className="banner" data-tone="info" role="status">
      <span className="banner-grow">
        We updated our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
      </span>
      <Button
        size="sm"
        iconOnly
        icon={X}
        variant="ghost"
        onClick={() => {
          storage.set('ip.notice.policies', POLICY_VERSION)
          setShow(false)
        }}
      >
        Dismiss policy update notice
      </Button>
    </div>
  )
}

/** B5: the server caches dashboard data for up to a minute. */
export function CacheNotice() {
  const [hidden, setHidden] = useState(() => storage.get('ip.notice.cache') === 'hidden')
  const [session, setSession] = useState(false)
  if (hidden || session) return null
  return (
    <div className="banner" data-tone="info" role="note">
      <span className="banner-grow">Dashboard totals can take up to a minute to update after a change. Invoice pages are always current.</span>
      <Button size="sm" variant="ghost" onClick={() => setSession(true)}>Dismiss</Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          storage.set('ip.notice.cache', 'hidden')
          setHidden(true)
        }}
      >
        Don’t show again
      </Button>
    </div>
  )
}

/** Registers /sw.js in production and reports when a new version is waiting. */
export function useServiceWorker() {
  const [waiting, setWaiting] = useState(null)
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return undefined
    let reloading = false
    const onChange = () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onChange)
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        if (reg.waiting) setWaiting(reg.waiting)
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker)
          })
        })
      })
      .catch(() => {})
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onChange)
  }, [])
  return { updateReady: Boolean(waiting), applyUpdate: () => waiting?.postMessage({ type: 'SKIP_WAITING' }) }
}
