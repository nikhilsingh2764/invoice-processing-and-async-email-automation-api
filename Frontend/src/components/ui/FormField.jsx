import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../lib/cn.js'
import { Icon } from './Icon.jsx'

/** Shared wrapper: label, hint, error. Wires aria-describedby and aria-invalid. */
function Field({ id, label, hint, error, optional, children, className }) {
  return (
    <div className={cn('field', className)}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
          {optional && <span className="label-optional"> (optional)</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-err`} role="alert">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  )
}

function useIds(idProp, error, hint) {
  const auto = useId()
  const id = idProp || auto
  const described = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return { id, described }
}

export const Input = forwardRef(function Input({ label, hint, error, optional, id: idProp, className, wrapperClassName, ...rest }, ref) {
  const { id, described } = useIds(idProp, error, hint)
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <input ref={ref} id={id} className={cn('input', className)} aria-invalid={error ? 'true' : undefined} aria-describedby={described} {...rest} />
    </Field>
  )
})

export const Textarea = forwardRef(function Textarea({ label, hint, error, optional, id: idProp, className, wrapperClassName, rows = 3, ...rest }, ref) {
  const { id, described } = useIds(idProp, error, hint)
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <textarea ref={ref} id={id} rows={rows} className={cn('textarea', className)} aria-invalid={error ? 'true' : undefined} aria-describedby={described} {...rest} />
    </Field>
  )
})

export const Select = forwardRef(function Select({ label, hint, error, optional, id: idProp, className, wrapperClassName, children, ...rest }, ref) {
  const { id, described } = useIds(idProp, error, hint)
  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <select ref={ref} id={id} className={cn('select', className)} aria-invalid={error ? 'true' : undefined} aria-describedby={described} {...rest}>
        {children}
      </select>
    </Field>
  )
})

/** The show/hide control is a real button with aria-pressed, so it works without a pointer. */
export const PasswordInput = forwardRef(function PasswordInput({ label, hint, error, id: idProp, className, wrapperClassName, autoComplete = 'current-password', ...rest }, ref) {
  const { id, described } = useIds(idProp, error, hint)
  const [shown, setShown] = useState(false)
  return (
    <Field id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <div className="input-affix">
        <input
          ref={ref}
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck={false}
          className={cn('input', className)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={described}
          {...rest}
        />
        <button type="button" className="input-affix-btn" aria-pressed={shown} aria-label="Show password" onClick={() => setShown((v) => !v)}>
          <Icon as={shown ? EyeOff : Eye} />
        </button>
      </div>
    </Field>
  )
})

export const Checkbox = forwardRef(function Checkbox({ label, error, id: idProp, children, ...rest }, ref) {
  const { id, described } = useIds(idProp, error)
  return (
    <div className="field">
      <label className="check" htmlFor={id}>
        <input ref={ref} id={id} type="checkbox" aria-invalid={error ? 'true' : undefined} aria-describedby={described} {...rest} />
        <span>{label || children}</span>
      </label>
      {error && (
        <p className="field-error" id={`${id}-err`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

export const Switch = forwardRef(function Switch({ label, id: idProp, ...rest }, ref) {
  const auto = useId()
  const id = idProp || auto
  return (
    <label className="switch" htmlFor={id}>
      <input ref={ref} id={id} type="checkbox" role="switch" {...rest} />
      <span className="switch-track" aria-hidden="true" />
      <span className="switch-thumb" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
})
