import { passwordChecks, passwordStrength } from '../../lib/password.js'

const LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']

/** Meter plus live rule checklist. The text label and the check marks carry meaning, not colour alone. */
export function PasswordStrength({ value = '', id }) {
  const level = passwordStrength(value)
  const checks = passwordChecks(value)
  return (
    <div id={id} aria-live="polite">
      <div className="strength" data-level={level} aria-hidden="true"><span /><span /><span /><span /></div>
      <p className="hint">Strength: <strong>{level ? LABEL[level] : 'Not entered'}</strong></p>
      <ul className="rule-list">
        {checks.map((c) => (
          <li key={c.id} data-ok={c.ok ? 'true' : 'false'}>
            <span aria-hidden="true">{c.ok ? '✓' : '○'}</span> {c.label}
            <span className="sr-only">{c.ok ? ' (met)' : ' (not met)'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
