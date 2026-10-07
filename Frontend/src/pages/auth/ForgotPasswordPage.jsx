import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Alert from '../../components/feedback/Alert';
import { useToast } from '../../components/feedback/toast-context';
import { forgotPassword } from '../../api/auth.api';
import { forgotSchema } from '../../lib/schemas';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const navigate = useNavigate();
  const toast = useToast();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError('');
    try {
      await forgotPassword(email);
      toast.success('Reset code sent. Check your email.');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['email'])) setFormError(normalizeError(error).message);
    }
  });

  return (
    <AuthCard
      title="Reset your password"
      subtitle="We’ll email you a 6-digit code."
      footer={<Link to="/login" className="font-medium text-brand hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <Input label="Email" type="email" autoComplete="email" autoFocus required error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Send reset code</Button>
      </form>
    </AuthCard>
  );
}
