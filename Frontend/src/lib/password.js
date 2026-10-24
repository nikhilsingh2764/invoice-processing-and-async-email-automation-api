import { COMMON_PASSWORDS } from './denylist.js'

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One of @ $ ! % * ? &', test: (p) => /[@$!%*?&]/.test(p) },
]

export const passwordChecks = (password = '') => PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(password) }))

export function isCommonPassword(password = '') {
  return COMMON_PASSWORDS.has(String(password).toLowerCase())
}

/** 0 to 4. Counts satisfied rules, then caps for common passwords. */
export function passwordStrength(password = '') {
  if (!password) return 0
  const ok = PASSWORD_RULES.filter((r) => r.test(password)).length
  let level = Math.max(0, Math.min(4, ok - 1))
  if (isCommonPassword(password)) level = Math.min(level, 1)
  if (password.length >= 12 && level >= 3) level = 4
  return level
}

/** Returns an advisory problem message or null: denylist, username, or email local part inside the password. */
export function passwordAdvice(password = '', { username = '', email = '' } = {}) {
  if (isCommonPassword(password)) return 'This password is too common. Choose something less guessable.'
  const lower = password.toLowerCase()
  const name = String(username).trim().toLowerCase()
  if (name.length >= 3 && lower.includes(name)) return 'Your password should not contain your username.'
  const local = String(email).split('@')[0].trim().toLowerCase()
  if (local.length >= 3 && lower.includes(local)) return 'Your password should not contain part of your email.'
  return null
}
