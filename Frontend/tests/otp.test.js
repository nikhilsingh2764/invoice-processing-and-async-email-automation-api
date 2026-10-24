import { describe, expect, it } from 'vitest'
import { initialOtp, otpReducer } from '../src/lib/otp.js'

describe('OTP state machine', () => {
  it('counts wrong codes and locks after five', () => {
    let s = initialOtp
    for (let i = 1; i <= 4; i += 1) {
      s = otpReducer(otpReducer(s, { type: 'verifying' }), { type: 'wrong' })
      expect(s.phase).toBe('entering')
      expect(s.wrong).toBe(i)
    }
    s = otpReducer(otpReducer(s, { type: 'verifying' }), { type: 'wrong' })
    expect(s.phase).toBe('locked')
    expect(s.message).toMatch(/Start again/)
  })
  it('ignores typing once locked or expired', () => {
    const locked = { ...initialOtp, phase: 'locked' }
    expect(otpReducer(locked, { type: 'digits', digits: ['1', '', '', '', '', ''] })).toBe(locked)
    const expired = otpReducer(initialOtp, { type: 'expired' })
    expect(otpReducer(expired, { type: 'digits', digits: ['1', '', '', '', '', ''] }).digits[0]).toBe('')
  })
  it('clears the boxes after a wrong code', () => expect(otpReducer({ ...initialOtp, digits: ['1', '2', '3', '4', '5', '6'] }, { type: 'wrong' }).digits.join('')).toBe(''))
})
