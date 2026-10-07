import { useId } from 'react';
import Field from './Field';
import { controlClasses, describedBy } from './field-styles';
import { cn } from '../../lib/cn';

export default function Textarea({ label, error, hint, required, className, id, ref, rows = 3, ...props }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <Field id={fieldId} label={label} error={error} hint={hint} required={required} className={className}>
      <textarea
        id={fieldId}
        ref={ref}
        rows={rows}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={cn(controlClasses(error), 'resize-y py-2')}
        {...props}
      />
    </Field>
  );
}
