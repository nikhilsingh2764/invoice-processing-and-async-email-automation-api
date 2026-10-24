import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/FormField.jsx'
import { forgotSchema } from '../../lib/validators.js'
import { authApi } from '../../api/endpoints.js'
import { normalizeError } from '../../api/errors.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

export default function ForgotPassword() {
  useDocumentTitle('Reset your password')
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [google, setGoogle] = useState(false)
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotSchema), defaultValues: { email: useLocation().state?.email || '' } })

  const submit = handleSubmit(async ({ email }) => {
    setError('')
    setGoogle(false)
    setBusy(true)
    try {
      await authApi.forgotPassword({ email })
      navigate('/reset-password', { state: { email, sent: true } })
    } catch (e) {
      const n = normalizeError(e)
      if (n.status === 404) navigate('/reset-password', { state: { email, sent: true } }) // identical to success: no account enumeration
      else if (n.status === 400 && /google/i.test(n.serverMessage)) setGoogle(true)
      else if (n.status === 429) setError('You have asked for a code too many times. Wait about 15 minutes and try again.')
      else setError(n.message)
    } finally {
      setBusy(false)
    }
  })

  return (
    <>
      <div>
        <h1 style={{ fontSize: 'var(--fluid-h1)' }} id="page-title" tabIndex={-1}>Reset your password</h1>
        <p className="muted">Enter your email. If an account exists, we will send a 6-digit code.</p>
      </div>
      {google && <Alert tone="info" title="This account uses Google">There is no password to reset. Go back to <Link to="/login">sign in</Link> and choose “Continue with Google”.</Alert>}
      {error && <Alert tone="danger">{error}</Alert>}
      <form onSubmit={submit} noValidate className="stack">
        <Input label="Email" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" spellCheck={false} error={errors.email?.message} {...register('email')} />
        <Button type="submit" variant="primary" size="lg" loading={busy}>Send code</Button>
      </form>
      <p className="muted"><Link to="/login">Back to sign in</Link></p>
    </>
  )
}
