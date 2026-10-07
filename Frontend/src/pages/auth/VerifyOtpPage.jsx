import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Alert from '../../components/feedback/Alert';
import { useToast } from '../../components/feedback/toast-context';
import { verifyOtp } from '../../api/auth.api';
import { otpSchema } from '../../lib/schemas';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function VerifyOtpPage() {
  useDocumentTitle('Verify email');
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: params.get('email') ?? '', otp: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      await verifyOtp(values);
      toast.success('Email verified. You can sign in now.');
      navigate('/login', { replace: true, state: { email: values.email, verified: true } });
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['email', 'otp'])) setFormError(normalizeError(error).message);
    }
  });

  return (
    <AuthCard
      title="Check your email"
      subtitle="Enter the 6-digit code we sent to verify your account."
      footer={<>Code expired? <Link to="/signup" className="font-medium text-brand hover:underline">Sign up again</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <Input
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          autoFocus
          required
          error={errors.otp?.message}
          inputClassName="text-center text-lg tracking-[0.4em] font-semibold"
          {...register('otp')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>Verify email</Button>
      </form>
    </AuthCard>
  );
}
