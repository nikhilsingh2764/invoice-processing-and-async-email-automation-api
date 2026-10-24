import { describe, expect, it } from 'vitest'
import { isCommonPassword, passwordAdvice, passwordChecks, passwordStrength } from '../src/lib/password.js'
import { passwordSchema } from '../src/lib/validators.js'

describe('password rules', () => {
  it('matches the server regex', () => {
    expect(passwordSchema.safeParse('Demo@1234').success).toBe(true)
    for (const bad of ['sh1A@', 'alllowercase1@', 'ALLUPPERCASE1@', 'NoDigits@@@', 'NoSpecial123']) expect(passwordSchema.safeParse(bad).success).toBe(false)
  })
  it('reports each rule', () => expect(passwordChecks('Abcdef1@').every((c) => c.ok)).toBe(true))
  it('scores 0 to 4 and caps common passwords', () => {
    expect(passwordStrength('')).toBe(0)
    expect(passwordStrength('password')).toBeLessThanOrEqual(1)
    expect(isCommonPassword('Password')).toBe(true)
    expect(passwordStrength('c0rrect-Horse@Battery')).toBe(4)
  })
  it('advises against username and email parts', () => {
    expect(passwordAdvice('Nikhil@12345', { username: 'nikhil' })).toMatch(/username/)
    expect(passwordAdvice('Zx!pw@sunita9', { email: 'sunita@x.co' })).toMatch(/email/)
    expect(passwordAdvice('Qw3rty!zxcvB')).toBeNull()
  })
})
