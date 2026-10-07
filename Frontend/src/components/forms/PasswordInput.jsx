import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Field from './Field';
import { controlClasses, describedBy } from './field-styles';
import { cn } from '../../lib/cn';

export default function PasswordInput({ label, error, hint, required, className, id, ref, ...props }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  return (
    <Field id={fieldId} label={label} error={error} hint={hint} required={required} className={className}>
      <div className="relative">
        <input
          id={fieldId}
          ref={ref}
          type={visible ? 'text' : 'password'}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn(controlClasses(error), 'h-10 pr-10')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-fg-subtle hover:text-fg"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  );
}
