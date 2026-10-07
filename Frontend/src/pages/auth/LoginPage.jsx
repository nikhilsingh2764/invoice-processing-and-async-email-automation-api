import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../../components/auth/AuthCard';
import GoogleButton from '../../components/auth/GoogleButton';
import { useAuth } from '../../components/auth/auth-context';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import PasswordInput from '../../components/forms/PasswordInput';
import Alert from '../../components/feedback/Alert';
import { useToast } from '../../components/feedback/toast-context';
import { login } from '../../api/auth.api';
import { loginSchema } from '../../lib/schemas';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { GOOGLE_CLIENT_ID } from '../../config/env';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const COOKIE_HELP =
  'You were signed in, but this browser did not keep the session cookie. Allow cookies for this site and make sure the backend CLIENT_URL matches this site’s address.';

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { establishSession } = useAuth();
  const [formError, setFormError] = useState('');

  const target = typeof location.state?.from === 'string' && location.state.from.startsWith('/') && !location.state.from.startsWith('/login')
    ? location.state.from
    : '/';

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: location.state?.email ?? '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      await login(values);
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['email', 'password'])) setFormError(normalizeError(error).message);
      return;
    }
    try {
      await establishSession();
    } catch {
      setFormError(COOKIE_HELP);
      return;
    }
    toast.success('Welcome back!');
    navigate(target, { replace: true });
  });

  const handleGoogleError = (error) => {
    setFormError(error?.response ? normalizeError(error).message : error?.message || COOKIE_HELP);
  };

  const needsVerification = /verify/i.test(formError);

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to manage your invoices."
      footer={<>New to InvoicePilot? <Link to="/signup" className="font-medium text-brand hover:underline">Create an account</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {location.state?.verified && <Alert tone="success">Email verified — you can sign in now.</Alert>}
        {location.state?.reset && <Alert tone="success">Password updated — sign in with your new password.</Alert>}
        {formError && (
          <Alert tone="error">
            {formError}
            {needsVerification && (
              <> <Link to="/signup" className="font-medium underline">Start signup again</Link> if your code expired.</>
            )}
          </Alert>
        )}
        <Input label="Email" type="email" autoComplete="email" autoFocus required error={errors.email?.message} {...register('email')} />
        <PasswordInput label="Password" autoComplete="current-password" required error={errors.password?.message} {...register('password')} />
        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
      </form>

      {GOOGLE_CLIENT_ID && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-fg-subtle">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton onDone={() => { toast.success('Welcome back!'); navigate(target, { replace: true }); }} onError={handleGoogleError} />
        </>
      )}
    </AuthCard>
  );
}
