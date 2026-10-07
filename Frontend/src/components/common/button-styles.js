import { cn } from '../../lib/cn';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:opacity-55 disabled:pointer-events-none select-none';

const variants = {
  primary: 'bg-brand text-brand-fg hover:bg-brand-hover shadow-card',
  secondary: 'border border-line-strong bg-surface text-fg hover:bg-surface-2',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger text-white hover:opacity-90 dark:text-[#1a0b0b]',
  dangerOutline: 'border border-danger/40 text-danger hover:bg-danger-soft',
};

const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', icon: 'size-9' };

export const buttonClasses = ({ variant = 'primary', size = 'md', className } = {}) =>
  cn(base, variants[variant], sizes[size], className);
