import { useEffect, useRef, useState } from 'react'
import { GOOGLE_CLIENT_ID } from '../../config/env.js'
import { useTheme } from '../../hooks/useTheme.jsx'

const SRC = 'https://accounts.google.com/gsi/client'
let loading = null

/** Loads Google Identity Services only when the button is actually shown and a client id is configured. */
function loadGis() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SRC
      s.async = true
      s.defer = true
      s.onload = () => resolve(window.google)
      s.onerror = () => {
        loading = null
        reject(new Error('Google sign-in could not be loaded'))
      }
      document.head.appendChild(s)
    })
  }
  return loading
}

export function GoogleButton({ onCredential, text = 'continue_with', disabled }) {
  const box = useRef(null)
  const cb = useRef(onCredential)
  cb.current = onCredential
  const [failed, setFailed] = useState(false)
  const { theme } = useTheme()
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined
    let alive = true
    loadGis()
      .then((google) => {
        if (!alive || !box.current) return
        google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r) => r?.credential && cb.current?.(r.credential), ux_mode: 'popup' })
        box.current.innerHTML = ''
        google.accounts.id.renderButton(box.current, { type: 'standard', theme: theme === 'dark' ? 'filled_black' : 'outline', size: 'large', text, shape: 'rectangular', width: Math.min(360, box.current.clientWidth || 360) })
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [theme, text])
  if (!GOOGLE_CLIENT_ID) return null
  return (
    <div aria-disabled={disabled || undefined} style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
      <div ref={box} style={{ minBlockSize: 44 }} />
      {failed && <p className="hint">Google sign-in could not be loaded. Use your email and password instead.</p>}
    </div>
  )
}
