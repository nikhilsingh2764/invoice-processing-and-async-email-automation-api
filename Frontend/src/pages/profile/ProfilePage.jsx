import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/forms/Input';
import PasswordInput from '../../components/forms/PasswordInput';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import Alert from '../../components/feedback/Alert';
import { useAuth } from '../../components/auth/auth-context';
import { useToast } from '../../components/feedback/toast-context';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { changePassword, deactivateAccount, deleteAccount, updateProfile } from '../../api/profile.api';
import { changePasswordSchema, usernameSchema } from '../../lib/schemas';
import { applyFieldErrors, getErrorMessage, normalizeError } from '../../lib/errors';
import { formatDate } from '../../lib/format';

function UsernameForm({ user }) {
  const { setUser } = useAuth();
  const toast = useToast();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: user.username },
  });
  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      setUser(await updateProfile(values));
      toast.success('Username updated.');
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['username'])) setFormError(normalizeError(error).message);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {formError && <Alert tone="error">{formError}</Alert>}
      <Input label="Username" error={errors.username?.message} {...register('username')} />
      <Input label="Email" value={user.email} readOnly disabled hint="Your email address cannot be changed." />
      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save changes</Button>
    </form>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });
  const onSubmit = handleSubmit(async ({ oldPassword, newPassword }) => {
    setFormError('');
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success('Password changed.');
      reset();
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['oldPassword', 'newPassword'])) setFormError(normalizeError(error).message);
    }
  });
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {formError && <Alert tone="error">{formError}</Alert>}
      <PasswordInput label="Current password" autoComplete="current-password" error={errors.oldPassword?.message} {...register('oldPassword')} />
      <PasswordInput label="New password" autoComplete="new-password" error={errors.newPassword?.message} hint="8+ characters with upper & lower case, a number and one of @ $ ! % * ? &" {...register('newPassword')} />
      <PasswordInput label="Confirm new password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      <Button type="submit" loading={isSubmitting}>Change password</Button>
    </form>
  );
}

export default function ProfilePage() {
  useDocumentTitle('Account');
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [dialog, setDialog] = useState(null); // 'deactivate' | 'delete'
  const [busy, setBusy] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const close = () => { setDialog(null); setDeletePassword(''); setDeleteError(''); };
  const finish = (message) => { clearSession(); toast.success(message); navigate('/login', { replace: true }); };

  const onDeactivate = async () => {
    setBusy(true);
    try { await deactivateAccount(); finish('Your account has been deactivated.'); }
    catch (e) { toast.error(getErrorMessage(e)); close(); }
    finally { setBusy(false); }
  };

  const onDelete = async () => {
    if (!deletePassword) { setDeleteError('Enter your password to confirm.'); return; }
    setBusy(true);
    try { await deleteAccount(deletePassword); finish('Your account has been deleted.'); }
    catch (e) { setDeleteError(getErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Account" description="Manage your sign-in details and security." />
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader title="Profile" action={<Badge tone={user.isVerified ? 'success' : 'warning'}>{user.isVerified ? 'Verified' : 'Unverified'}</Badge>} />
          <CardBody>
            <UsernameForm user={user} />
            <p className="mt-4 text-xs text-fg-muted">Member since {formatDate(user.createdAt)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Change password" />
          <CardBody><PasswordForm /></CardBody>
        </Card>
        <Card className="border-danger/30">
          <CardHeader title="Danger zone" />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1 basis-60"><p className="font-medium text-fg">Deactivate account</p><p className="text-sm text-fg-muted">You will be signed out and will not be able to sign in again until the account is reactivated.</p></div>
              <Button variant="dangerOutline" onClick={() => setDialog('deactivate')}>Deactivate</Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="min-w-0 flex-1 basis-60"><p className="font-medium text-fg">Delete account</p><p className="text-sm text-fg-muted">Permanently deletes your account. Requires your password.</p></div>
              <Button variant="danger" onClick={() => setDialog('delete')}>Delete account</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog open={dialog === 'deactivate'} title="Deactivate your account?" message="You will be signed out immediately."
        confirmLabel="Deactivate" loading={busy} onConfirm={onDeactivate} onCancel={close} />
      <ConfirmDialog open={dialog === 'delete'} title="Delete your account?" message="This permanently deletes your account and cannot be undone."
        confirmLabel="Delete forever" loading={busy} onConfirm={onDelete} onCancel={close}>
        <div className="mt-4">
          <PasswordInput label="Confirm with your password" autoComplete="current-password" value={deletePassword}
            onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }} error={deleteError} />
        </div>
      </ConfirmDialog>
    </>
  );
}
