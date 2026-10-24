import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Checkbox, Input, PasswordInput } from '../../components/ui/FormField.jsx'
import { PasswordStrength } from '../../components/ui/PasswordStrength.jsx'
import { GoogleButton } from '../../components/ui/GoogleButton.jsx'
import { signupSchema } from '../../lib/validators.js'
import { authApi } from '../../api/endpoints.js'
import { normalizeError } from '../../api/errors.js'
import { applyServerErrors } from '../../lib/forms.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { GOOGLE_CLIENT_ID } from '../../config/env.js'
import { report } from '../../lib/report.js'

export default function Signup() {
  useDocumentTitle('Create your account')
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  const kept = useLocation().state?.draft
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, watch, setError: setFieldError, resetField, setFocus, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: kept?.username || '', email: kept?.email || '', password: '', acceptTerms: false },
  })
  const password = watch('password')

  const submit = handleSubmit(async (values) => {
    setError('')
    setBusy(true)
    try {
      const body = await authApi.signup(values)
      resetField('password')
      // The email travels in router state, never in the URL. The password is never kept.
      navigate('/verify-otp', { state: { email: body?.email || values.email.toLowerCase(), username: values.username } })
    } catch (e) {
      report(e, { where: 'signup' })
      resetField('password')
      const n = normalizeError(e)
      if (!applyServerErrors(setFieldError, e)) {
        if (n.status === 409) setFieldError('username', { message: 'That username is taken. Try another.' })
        else setError(n.message)
      }
    } finally {
      setBusy(false)
    }
  }, (errs) => {
    const first = Object.keys(errs)[0]
    if (first) setFocus(first)
  })

  const google = async (credential) => {
    setBusy(true)
    try {
      await loginWithGoogle(credential)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(normalizeError(e).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div>
        <h1 style={{ fontSize: 'var(--fluid-h1)' }} id="page-title" tabIndex={-1}>Create your account</h1>
        <p className="muted">Free to use. We will email you a 6-digit code to confirm your address.</p>
      </div>
      {error && <Alert tone="danger" title="Could not create the account">{error}</Alert>}
      <form onSubmit={submit} noValidate className="stack">
        <Input label="Username" autoComplete="username" autoCapitalize="off" spellCheck={false} hint="3 to 30 letters, numbers or underscores" error={errors.username?.message} {...register('username')} />
        <Input label="Email" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" spellCheck={false} error={errors.email?.message} {...register('email')} />
        <PasswordInput label="Password" autoComplete="new-password" aria-describedby="pw-strength" error={errors.password?.message} {...register('password')} />
        <PasswordStrength id="pw-strength" value={password} />
        <Checkbox error={errors.acceptTerms?.message} {...register('acceptTerms')}>
          I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and the <Link to="/privacy" target="_blank">Privacy Policy</Link>.
        </Checkbox>
        <Button type="submit" variant="primary" size="lg" loading={busy}>Create account</Button>
      </form>
      {GOOGLE_CLIENT_ID && (
        <>
          <div className="divider-text">or</div>
          <GoogleButton onCredential={google} text="signup_with" disabled={busy} />
        </>
      )}
      <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>
    </>
  )
}
