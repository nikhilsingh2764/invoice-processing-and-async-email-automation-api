import { useId } from 'react';
import Field from './Field';
import { controlClasses, describedBy } from './field-styles';
import { cn } from '../../lib/cn';

export default function Input({ label, error, hint, required, className, inputClassName, id, ref, ...props }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} error={error} hint={hint} required={required} className={className}>
      <input
        id={fieldId}
        ref={ref}
        required={undefined}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(controlClasses(error), 'h-10', inputClassName)}
        {...props}
      />
    </Field>
  );
}
