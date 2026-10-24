import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, PasswordInput } from '../../components/ui/FormField.jsx'
import { GoogleButton } from '../../components/ui/GoogleButton.jsx'
import { loginSchema } from '../../lib/validators.js'
import { normalizeError } from '../../api/errors.js'
import { useAuth, CookiesBlockedError } from '../../hooks/useAuth.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { LOCKOUT } from '../../config/features.js'
import { GOOGLE_CLIENT_ID } from '../../config/env.js'
import { safeNextPath } from '../../lib/security.js'
import { report } from '../../lib/report.js'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Login() {
  useDocumentTitle('Sign in')
  const { login, loginWithGoogle, notice, dismissNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [lock, setLock] = useState(0)
  const [busy, setBusy] = useState(false)
  const next = safeNextPath(params.get('next')) || '/dashboard'
  const passed = location.state?.notice
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: location.state?.email || '', password: '' } })
  const { register, handleSubmit, resetField, setFocus, formState: { errors } } = form

  useEffect(() => {
    if (lock <= 0) return undefined
    const t = setInterval(() => setLock((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [lock > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  const fail = (e) => {
    resetField('password')
    const n = normalizeError(e)
    if (e instanceof CookiesBlockedError) setError(e.message)
    else if (n.status === 429) {
      const locked = /locked/i.test(n.serverMessage)
      setLock(locked ? LOCKOUT.accountLockSeconds : LOCKOUT.rateLimitSeconds)
      setError(locked ? 'Too many wrong passwords. This account is locked for a short time.' : 'Too many attempts. Please wait before trying again.')
    } else if (/verify your email/i.test(n.serverMessage)) setError('This email is not verified yet. Sign up again to get a new code.')
    else if (/inactive|deactivated/i.test(n.serverMessage)) setError('This account is deactivated. Contact support to restore it.')
    else if (/google/i.test(n.serverMessage)) setError('This account uses Google. Choose “Continue with Google”.')
    else if (n.isNetwork || n.isTimeout || n.status >= 500) setError(n.message)
    else setError('Email or password is incorrect.')
    setFocus('email')
  }

  const submit = handleSubmit(async (values) => {
    setError('')
    setBusy(true)
    try {
      await login(values)
      navigate(next, { replace: true })
    } catch (e) {
      report(e, { where: 'login' })
      fail(e)
    } finally {
      setBusy(false)
    }
  })

  const google = async (credential) => {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle(credential)
      navigate(next, { replace: true })
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div>
        <h1 style={{ fontSize: 'var(--fluid-h1)' }} id="page-title" tabIndex={-1}>Sign in</h1>
        <p className="muted">Welcome back. Pick up where you left off.</p>
      </div>
      {passed && <Alert tone="success">{passed}</Alert>}
      {notice && <Alert tone="warning" actions={<Button size="sm" onClick={dismissNotice}>Dismiss</Button>}>{notice}</Alert>}
      {error && <Alert tone="danger" title="Could not sign in">{error}{lock > 0 && <> Try again in <strong className="tabular">{fmt(lock)}</strong>.</>}</Alert>}
      <form onSubmit={submit} noValidate className="stack">
        <Input label="Email" type="email" autoComplete="username" inputMode="email" autoCapitalize="off" spellCheck={false} error={errors.email?.message} {...register('email')} />
        <PasswordInput label="Password" error={errors.password?.message} {...register('password')} />
        <div style={{ textAlign: 'end' }}><Link to="/forgot-password" state={{ email: form.getValues('email') }}>Forgot password?</Link></div>
        <Button type="submit" variant="primary" size="lg" loading={busy} disabled={lock > 0}>{lock > 0 ? `Locked for ${fmt(lock)}` : 'Sign in'}</Button>
      </form>
      {GOOGLE_CLIENT_ID && (
        <>
          <div className="divider-text">or</div>
          <GoogleButton onCredential={google} text="signin_with" disabled={busy || lock > 0} />
        </>
      )}
      <p className="muted">New to InvoicePilot? <Link to="/signup">Create an account</Link></p>
    </>
  )
}
