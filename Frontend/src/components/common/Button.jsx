import { Loader2 } from 'lucide-react';
import { buttonClasses } from './button-styles';

export default function Button({ variant, size, className, loading = false, disabled, children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
