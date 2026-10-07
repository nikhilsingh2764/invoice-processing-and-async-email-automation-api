import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../../components/auth/AuthCard';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import PasswordInput from '../../components/forms/PasswordInput';
import Alert from '../../components/feedback/Alert';
import { useToast } from '../../components/feedback/toast-context';
import { signup } from '../../api/auth.api';
import { signupSchema } from '../../lib/schemas';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function SignupPage() {
  useDocumentTitle('Create account');
  const navigate = useNavigate();
  const toast = useToast();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ username, email, password }) => {
    setFormError('');
    try {
      const data = await signup({ username, email, password });
      toast.success('We emailed you a 6-digit verification code.');
      navigate(`/verify-otp?email=${encodeURIComponent(data?.email || email)}`);
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['username', 'email', 'password'])) setFormError(normalizeError(error).message);
    }
  });

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start sending professional invoices in minutes."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-brand hover:underline">Sign in</Link></>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <Input label="Username" autoComplete="username" autoFocus required error={errors.username?.message} hint="3–30 characters: letters, numbers, underscores." {...register('username')} />
        <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <PasswordInput label="Password" autoComplete="new-password" required error={errors.password?.message} hint="8+ characters with upper & lower case, a number and one of @ $ ! % * ? &" {...register('password')} />
        <PasswordInput label="Confirm password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>
    </AuthCard>
  );
}
