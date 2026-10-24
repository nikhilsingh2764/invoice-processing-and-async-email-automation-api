import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, PasswordInput } from '../../components/ui/FormField.jsx'
import { PasswordStrength } from '../../components/ui/PasswordStrength.jsx'
import { resetSchema } from '../../lib/validators.js'
import { authApi } from '../../api/endpoints.js'
import { normalizeError } from '../../api/errors.js'
import { applyServerErrors } from '../../lib/forms.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

export default function ResetPassword() {
  useDocumentTitle('Choose a new password')
  const { state } = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, watch, setError: setFieldError, resetField, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: state?.email || '', otp: '', newPassword: '', confirmPassword: '' },
  })

  const submit = handleSubmit(async (values) => {
    setError('')
    setBusy(true)
    try {
      await authApi.resetPassword(values)
      navigate('/login', { replace: true, state: { email: values.email, notice: 'Password changed. Sign in with your new password.' } })
    } catch (e) {
      resetField('newPassword')
      resetField('confirmPassword')
      const n = normalizeError(e)
      if (applyServerErrors(setFieldError, e, { otp: 'otp' })) return
      if (n.status === 400 && /google/i.test(n.serverMessage)) setError('This account uses Google, so there is no password to reset. Sign in with Google instead.')
      else if (n.status === 400 || n.status === 404) setError('That code is not valid or has expired. Check the code, or request a new one.')
      else if (n.status === 429) setError('Too many attempts. Wait a few minutes and try again.')
      else setError(n.message)
    } finally {
      setBusy(false)
    }
  })

  return (
    <>
      <div>
        <h1 style={{ fontSize: 'var(--fluid-h1)' }} id="page-title" tabIndex={-1}>Choose a new password</h1>
        {state?.sent && <p className="muted">If an account exists for that email, a code is on its way. It can take a minute to arrive.</p>}
      </div>
      {error && <Alert tone="danger">{error}</Alert>}
      <form onSubmit={submit} noValidate className="stack">
        <Input label="Email" type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
        <Input label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} error={errors.otp?.message} {...register('otp')} />
        <PasswordInput label="New password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
        <PasswordStrength value={watch('newPassword')} />
        <PasswordInput label="Confirm new password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" variant="primary" size="lg" loading={busy}>Change password</Button>
      </form>
      <p className="muted"><Link to="/forgot-password">Send a new code</Link> · <Link to="/login">Back to sign in</Link></p>
    </>
  )
}
