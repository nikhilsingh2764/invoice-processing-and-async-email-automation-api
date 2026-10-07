import { cn } from '../../lib/cn';

/** Label + control slot + hint/error text. `id` links label, control and messages. */
export default function Field({ id, label, error, hint, required, className, children }) {
  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-fg">
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-danger">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-fg-muted">{hint}</p>
      ) : null}
    </div>
  );
}

