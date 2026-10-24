import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, Letterhead, FormZone, KeyValue } from '../../components/sheet/index.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, PasswordInput } from '../../components/ui/FormField.jsx'
import { PasswordStrength } from '../../components/ui/PasswordStrength.jsx'
import { Modal, ConfirmDialog } from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useUpdateProfile } from '../../hooks/queries.js'
import { authApi } from '../../api/endpoints.js'
import { normalizeError } from '../../api/errors.js'
import { applyServerErrors } from '../../lib/forms.js'
import { changePasswordSchema, deleteAccountSchema, profileSchema } from '../../lib/validators.js'
import { formatDate } from '../../lib/format.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { SITE } from '../../config/site.js'

const isGoogle = (e) => normalizeError(e).status === 400 && /google/i.test(normalizeError(e).serverMessage)

function GoogleExplainer({ what }) {
  return (
    <Alert tone="info" title="You signed in with Google">
      So there is no password to {what}. Manage your Google account security from your Google settings.
    </Alert>
  )
}

export default function Account() {
  useDocumentTitle('Account')
  const toast = useToast()
  const { user, setUser, clearSession } = useAuth()
  const updateProfile = useUpdateProfile()
  const [pwGoogle, setPwGoogle] = useState(false)
  const [delGoogle, setDelGoogle] = useState(false)
  const [deactivate, setDeactivate] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [busy, setBusy] = useState(false)

  const profile = useForm({ resolver: zodResolver(profileSchema), defaultValues: { username: user?.username || '' } })
  const pw = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' } })
  const del = useForm({ resolver: zodResolver(deleteAccountSchema), defaultValues: { password: '', confirmText: '' } })

  const saveProfile = profile.handleSubmit(async (values) => {
    try {
      const u = await updateProfile.mutateAsync(values)
      setUser({ ...user, ...u })
      profile.reset({ username: u.username })
      toast.success('Profile updated')
    } catch (e) {
      const n = normalizeError(e)
      if (!applyServerErrors(profile.setError, e)) profile.setError('username', { message: n.status === 400 || n.status === 409 ? 'That username is taken. Try another.' : n.message })
    }
  })

  const changePw = pw.handleSubmit(async (values) => {
    try {
      await authApi.changePassword(values)
      pw.reset()
      toast.success('Password changed')
    } catch (e) {
      pw.resetField('oldPassword')
      const n = normalizeError(e)
      if (isGoogle(e)) setPwGoogle(true)
      else if (n.status === 401) pw.setError('oldPassword', { message: 'Your current password is not correct.' })
      else if (!applyServerErrors(pw.setError, e)) toast.error('Could not change the password', n.message)
    }
  })

  const doDeactivate = async () => {
    setBusy(true)
    try {
      await authApi.deactivate()
      clearSession({ notice: 'Your account was deactivated.' })
    } catch (e) {
      setDeactivate(false)
      toast.error('Could not deactivate', normalizeError(e).message)
    } finally {
      setBusy(false)
    }
  }

  const doDelete = del.handleSubmit(async (values) => {
    setBusy(true)
    try {
      await authApi.deleteAccount(values)
      clearSession({ notice: 'Your account and data were deleted.' })
    } catch (e) {
      del.resetField('password')
      const n = normalizeError(e)
      if (isGoogle(e)) { setDelGoogle(true); setDeleting(false) }
      else if (n.status === 401) del.setError('password', { message: 'That password is not correct.' })
      else toast.error('Could not delete the account', n.message)
    } finally {
      setBusy(false)
    }
  })

  return (
    <div className="stack-lg">
      <Letterhead title="Account" description="Your sign-in details and security." crumbs={[{ to: '/dashboard', label: 'Dashboard' }, { label: 'Account' }]} />
      <Sheet>
        <FormZone n="1" title="Profile" id="a-profile">
          <KeyValue rows={[{ label: 'Email', value: user?.email }, { label: 'Member since', value: user?.createdAt ? formatDate(user.createdAt) : '' }]} />
          <form onSubmit={saveProfile} noValidate className="stack" style={{ maxInlineSize: '24rem' }}>
            <Input label="Username" autoComplete="username" error={profile.formState.errors.username?.message} {...profile.register('username')} />
            <div><Button type="submit" variant="primary" loading={updateProfile.isPending} disabled={!profile.formState.isDirty}>Save username</Button></div>
          </form>
        </FormZone>

        <FormZone n="2" title="Password" id="a-pw">
          {pwGoogle ? <GoogleExplainer what="change" /> : (
            <form onSubmit={changePw} noValidate className="stack" style={{ maxInlineSize: '24rem' }}>
              <PasswordInput label="Current password" error={pw.formState.errors.oldPassword?.message} {...pw.register('oldPassword')} />
              <PasswordInput label="New password" autoComplete="new-password" error={pw.formState.errors.newPassword?.message} {...pw.register('newPassword')} />
              <PasswordStrength value={pw.watch('newPassword')} />
              <PasswordInput label="Confirm new password" autoComplete="new-password" error={pw.formState.errors.confirmPassword?.message} {...pw.register('confirmPassword')} />
              <div><Button type="submit" variant="primary" loading={pw.formState.isSubmitting}>Change password</Button></div>
            </form>
          )}
        </FormZone>
      </Sheet>

      <section className="card" data-tone="danger" aria-labelledby="dz">
        <h2 className="card-title" id="dz">Danger zone</h2>
        <div className="stack">
          <div>
            <h3>Deactivate account</h3>
            <p className="muted">Signs you out and blocks sign-in until the account is restored by support.</p>
            <Button variant="danger" onClick={() => setDeactivate(true)}>Deactivate account…</Button>
          </div>
          <div>
            <h3>Delete account</h3>
            <p className="muted">Permanently deletes your account and data. See <Link to="/data-rights">your data rights</Link>.</p>
            {delGoogle ? (
              <Alert tone="info" title="Google accounts can’t be deleted here">Email <a href={`mailto:${SITE.privacyEmail}?subject=Delete%20my%20account`}>{SITE.privacyEmail}</a> from your Google address and we will delete it for you.</Alert>
            ) : <Button variant="danger" onClick={() => (del.reset(), setDeleting(true))}>Delete account…</Button>}
          </div>
        </div>
      </section>

      <ConfirmDialog open={deactivate} onClose={() => setDeactivate(false)} onConfirm={doDeactivate} loading={busy} title="Deactivate your account?" confirmLabel="Deactivate">
        <p>You will be signed out now. Your data is kept, and support can restore access.</p>
      </ConfirmDialog>
      <Modal open={deleting} onClose={busy ? undefined : () => setDeleting(false)} size="sm" dismissible={!busy}>
        <Modal.Header title="Delete your account?" />
        <form onSubmit={doDelete} noValidate>
          <Modal.Body>
            <div className="stack">
              <Alert tone="danger">This permanently deletes your account, business, customers, products and invoices.</Alert>
              <PasswordInput label="Password" error={del.formState.errors.password?.message} data-autofocus {...del.register('password')} />
              <Input label="Type DELETE to confirm" autoComplete="off" error={del.formState.errors.confirmText?.message} {...del.register('confirmText')} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setDeleting(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" variant="danger" loading={busy}>Delete account</Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  )
}
