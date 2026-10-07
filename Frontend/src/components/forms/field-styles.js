import { cn } from '../../lib/cn';

export const controlClasses = (error) =>
  cn(
    'w-full rounded-lg border bg-surface px-3 text-sm text-fg transition-colors',
    'placeholder:text-fg-subtle disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-70',
    'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25',
    error ? 'border-danger' : 'border-line-strong',
  );

export const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);
