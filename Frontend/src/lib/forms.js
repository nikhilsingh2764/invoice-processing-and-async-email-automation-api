import { normalizeError } from '../api/errors.js'

/** Maps server `errors` onto form fields. Returns true when at least one field was set. */
export function applyServerErrors(setError, error, aliases = {}) {
  const { fieldErrors } = normalizeError(error)
  let any = false
  for (const [path, message] of Object.entries(fieldErrors)) {
    setError(aliases[path] || path, { type: 'server', message })
    any = true
  }
  return any
}

/** Moves focus to the first invalid field after a failed submit. */
export const focusFirstError = (errors, setFocus) => {
  const first = Object.keys(errors)[0]
  if (first) setFocus(first)
}
