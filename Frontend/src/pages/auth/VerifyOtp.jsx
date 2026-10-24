import { useEffect, useReducer, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button, LinkButton } from '../../components/ui/Button.jsx'
import { authApi } from '../../api/endpoints.js'
import { normalizeError } from '../../api/errors.js'
import { OTP } from '../../config/features.js'
import { initialOtp, otpReducer } from '../../lib/otp.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function VerifyOtp() {
  useDocumentTitle('Verify your email')
  const { state: nav } = useLocation()
  const navigate = useNavigate()
  const [s, dispatch] = useReducer(otpReducer, initialOtp)
  const [left, setLeft] = useState(OTP.lifetimeSeconds)
  const refs = useRef([])
  const email = nav?.email

  useEffect(() => {
    if (s.phase === 'success' || s.phase === 'locked') return undefined
    const t = setInterval(() => setLeft((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [s.phase])
  useEffect(() => {
    if (left <= 0 && s.phase !== 'expired' && s.phase !== 'success' && s.phase !== 'locked') dispatch({ type: 'expired' })
  }, [left, s.phase])
  useEffect(() => refs.current[0]?.focus(), [])

  if (!email) return <Navigate to="/signup" replace />
  const done = s.phase === 'locked' || s.phase === 'expired'

  const submit = async (digits) => {
    dispatch({ type: 'verifying' })
    try {
      await authApi.verifyOtp({ email, otp: digits.join('') })
      dispatch({ type: 'success' })
      navigate('/login', { replace: true, state: { email, notice: 'Email verified. You can sign in now.' } })
    } catch (e) {
      const n = normalizeError(e)
      if (n.status === 400 && /expired/i.test(n.serverMessage)) dispatch({ type: 'expired' })
      else if (n.status === 400) dispatch({ type: 'wrong' })
      else dispatch({ type: 'error', message: n.message })
      refs.current[0]?.focus()
    }
  }

  const set = (i, value) => {
    const v = value.replace(/\D/g, '')
    if (!v) return
    const digits = [...s.digits]
    if (v.length > 1) {
      // Paste or autofill: spread across the boxes.
      v.slice(0, 6).split('').forEach((c, k) => (digits[k] = c))
    } else digits[i] = v
    dispatch({ type: 'digits', digits })
    const last = Math.min(5, v.length > 1 ? v.length - 1 : i)
    if (v.length === 1 && i < 5) refs.current[i + 1]?.focus()
    else refs.current[last]?.focus()
    if (digits.every(Boolean)) submit(digits)
  }
  const onKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const digits = [...s.digits]
      if (digits[i]) digits[i] = ''
      else if (i > 0) {
        digits[i - 1] = ''
        refs.current[i - 1]?.focus()
      }
      dispatch({ type: 'digits', digits })
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }

  return (
    <>
      <div>
        <h1 style={{ fontSize: 'var(--fluid-h1)' }} id="page-title" tabIndex={-1}>Check your email</h1>
        <p className="muted">We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{email}</strong>.</p>
      </div>
      {s.message && <Alert tone={done ? 'danger' : 'warning'}>{s.message}</Alert>}
      <div role="group" aria-label="6-digit verification code" className="otp">
        {s.digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className="input"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={i === 0 ? 6 : 1}
            aria-label={`Digit ${i + 1} of 6`}
            value={d}
            disabled={done || s.phase === 'verifying' || s.phase === 'success'}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={(e) => {
              e.preventDefault()
              set(0, e.clipboardData.getData('text'))
            }}
          />
        ))}
      </div>
      <p className="muted tabular" role="timer" aria-live="off">{left > 0 && !done ? <>Code expires in <strong>{fmt(left)}</strong></> : 'Code expired'}</p>
      {!done && <Button variant="primary" size="lg" loading={s.phase === 'verifying'} disabled={s.digits.some((d) => !d)} onClick={() => submit(s.digits)}>Verify email</Button>}
      {done && <LinkButton to="/signup" variant="primary" state={{ draft: { username: nav?.username, email } }}>Start again</LinkButton>}
      <p className="muted">There is no resend option. <Link to="/signup" state={{ draft: { username: nav?.username, email } }}>Start again</Link> to get a fresh code.</p>
    </>
  )
}
