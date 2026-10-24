import { describe, expect, it } from 'vitest'
import { clampInt, escapeRegex, isPdfBytes, plainSnippet, safeFilename, safeNextPath, safeUrl, scrubPII } from '../src/lib/security.js'

describe('safeNextPath (open redirect)', () => {
  const good = ['/dashboard', '/invoices?status=Paid&page=2', '/invoices/abc123/edit']
  const bad = ['//evil.com', '///evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '/%2f%2fevil.com', '/%252f%252fevil.com', '/%5cevil.com', '\\\\evil.com', '', 'dashboard', '/\tfoo', '/%0d%0aSet-Cookie:x', '/javascript:alert(1)', null, undefined, 42, `/${'a'.repeat(600)}`]
  it.each(good)('accepts %s', (p) => expect(safeNextPath(p)).toBe(p))
  it.each(bad)('rejects %s', (p) => expect(safeNextPath(p)).toBeNull())
})

describe('safeUrl', () => {
  it('allows https', () => expect(safeUrl('https://example.com/logo.png', { dev: false })).toBe('https://example.com/logo.png'))
  it('rejects other schemes', () => {
    for (const u of ['javascript:alert(1)', 'data:text/html,hi', 'http://example.com', 'ftp://x.co', 'file:///etc/passwd', '//example.com', 'https://exa\nmple.com', 'not a url', '', null]) expect(safeUrl(u, { dev: false })).toBeNull()
  })
  it('allows http only for localhost in dev', () => {
    expect(safeUrl('http://localhost:5173/x.png', { dev: true })).not.toBeNull()
    expect(safeUrl('http://localhost:5173/x.png', { dev: false })).toBeNull()
    expect(safeUrl('http://evil.com/x.png', { dev: true })).toBeNull()
  })
  it('rejects very long input', () => expect(safeUrl(`https://a.co/${'x'.repeat(3000)}`, { dev: false })).toBeNull())
})

describe('safeFilename', () => {
  it('strips path and control characters', () => {
    expect(safeFilename('../../etc/passwd')).not.toMatch(/[\\/]/)
    expect(safeFilename('INV-1001')).toBe('INV-1001')
    expect(safeFilename('a\u0000b:c*d?.pdf')).not.toMatch(/[\u0000:*?]/)
  })
  it('falls back when empty', () => {
    expect(safeFilename('')).toBe('invoice')
    expect(safeFilename('...')).toBe('invoice')
    expect(safeFilename(undefined)).toBe('invoice')
  })
  it('limits length', () => expect(safeFilename('a'.repeat(300)).length).toBeLessThanOrEqual(100))
})

describe('escapeRegex', () => {
  it('escapes every metacharacter so the server regex is literal', () => {
    const input = '.*+?^${}()|[]\\'
    expect(new RegExp(escapeRegex(input)).test(input)).toBe(true)
    expect(new RegExp(`^${escapeRegex('a.c')}$`).test('abc')).toBe(false)
  })
})

describe('isPdfBytes', () => {
  it('checks the magic number', () => {
    expect(isPdfBytes(new TextEncoder().encode('%PDF-1.7\n').buffer)).toBe(true)
    expect(isPdfBytes(new TextEncoder().encode('<html>').buffer)).toBe(false)
    expect(isPdfBytes(new ArrayBuffer(2))).toBe(false)
    expect(isPdfBytes(null)).toBe(false)
  })
})

describe('scrubPII', () => {
  it('removes emails, long numbers and tokens', () => {
    const out = scrubPII('user a.b@x.co phone 9876543210 token eyJhbGciOi.eyJzdWIi.sig')
    expect(out).not.toMatch(/a\.b@x\.co|9876543210|eyJ/)
  })
})

describe('clampInt / plainSnippet', () => {
  it('clamps', () => {
    expect(clampInt('5', 1, 10, 1)).toBe(5)
    expect(clampInt('-4', 1, 10, 1)).toBe(1)
    expect(clampInt('999', 1, 10, 1)).toBe(10)
    expect(clampInt('abc', 1, 10, 7)).toBe(7)
  })
  it('turns HTML error pages into short plain text', () => {
    const out = plainSnippet('<html><body><h1>502 Bad Gateway</h1><script>alert(1)</script></body></html>', 40)
    expect(out).not.toMatch(/[<>]/)
    expect(out.length).toBeLessThanOrEqual(41)
  })
})
