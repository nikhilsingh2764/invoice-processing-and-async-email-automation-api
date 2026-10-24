import { describe, expect, it } from 'vitest'
import { extractFieldErrors, normalizeError, MESSAGES } from '../src/api/errors.js'

const http = (status, data) => ({ response: { status, data } })

describe('normalizeError', () => {
  it('uses the server message for 4xx', () => expect(normalizeError(http(400, { message: 'Invalid OTP' })).message).toBe('Invalid OTP'))
  it('hides server detail on 5xx', () => expect(normalizeError(http(500, { message: 'stack trace here' })).message).toBe(MESSAGES.server))
  it('429 gets a friendly message', () => expect(normalizeError(http(429, { message: 'x' })).isRateLimit).toBe(true))
  it('network and timeout', () => {
    expect(normalizeError({ code: 'ERR_NETWORK' }).isNetwork).toBe(true)
    expect(normalizeError({ code: 'ECONNABORTED' }).isTimeout).toBe(true)
    expect(normalizeError({ code: 'ERR_CANCELED' }).isCanceled).toBe(true)
  })
  it('turns an HTML proxy page into short plain text', () => expect(normalizeError(http(404, '<html><h1>Nope</h1></html>')).message).not.toMatch(/</))
  it('reads validation errors in both shapes', () => {
    expect(extractFieldErrors({ errors: [{ path: 'email', msg: 'Bad' }] })).toEqual({ email: 'Bad' })
    expect(extractFieldErrors({ errors: { phone: 'Short' } })).toEqual({ phone: 'Short' })
    expect(extractFieldErrors({})).toEqual({})
  })
})
