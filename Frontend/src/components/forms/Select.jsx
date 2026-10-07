import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import Field from './Field';
import { controlClasses, describedBy } from './field-styles';
import { cn } from '../../lib/cn';

export default function Select({ label, error, hint, required, className, selectClassName, id, ref, children, ...props }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <select
          id={fieldId}
          ref={ref}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlClasses(error), 'h-10 appearance-none pr-9', selectClassName)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
      </div>
    </Field>
  );
}
