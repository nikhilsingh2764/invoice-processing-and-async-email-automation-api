import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import PasswordInput from '../../components/forms/PasswordInput';
import Alert from '../../components/feedback/Alert';
import { useToast } from '../../components/feedback/toast-context';
import { resetPassword } from '../../api/auth.api';
import { resetSchema } from '../../lib/schemas';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ResetPasswordPage() {
  useDocumentTitle('Set new password');
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: params.get('email') ?? '', otp: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      await resetPassword(values);
      toast.success('Password updated.');
      navigate('/login', { replace: true, state: { email: values.email, reset: true } });
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['email', 'otp', 'newPassword', 'confirmPassword'])) setFormError(normalizeError(error).message);
    }
  });

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Enter the code from your email and choose a new password."
      footer={<>No code? <Link to="/forgot-password" className="font-medium text-brand hover:underline">Request another</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <Input label="Verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" required error={errors.otp?.message} inputClassName="text-center tracking-[0.4em] font-semibold" {...register('otp')} />
        <PasswordInput label="New password" autoComplete="new-password" required error={errors.newPassword?.message} hint="8+ characters with upper & lower case, a number and one of @ $ ! % * ? &" {...register('newPassword')} />
        <PasswordInput label="Confirm new password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Update password</Button>
      </form>
    </AuthCard>
  );
}
