import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const root = new URL('..', import.meta.url).pathname
const vercel = JSON.parse(readFileSync(`${root}vercel.json`, 'utf8'))
const netlify = readFileSync(`${root}public/_headers`, 'utf8')
const all = vercel.headers.find((h) => h.source === '/(.*)').headers
const vercelHeader = (k) => all.find((h) => h.key === k)?.value
const netlifyHeader = (k) => new RegExp(`^\\s+${k}: (.+)$`, 'm').exec(netlify)?.[1]?.trim()

describe('security headers', () => {
  const required = ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy']
  it.each(required)('vercel.json and _headers agree on %s', (k) => {
    expect(vercelHeader(k)).toBeDefined()
    expect(netlifyHeader(k)).toBe(vercelHeader(k))
  })
  it('CSP forbids inline and eval scripts and framing', () => {
    const csp = vercelHeader('Content-Security-Policy')
    expect(csp).toMatch(/default-src 'self'/)
    expect(csp).toMatch(/object-src 'none'/)
    expect(csp).toMatch(/frame-ancestors 'none'/)
    expect(csp).toMatch(/base-uri 'self'/)
    expect(csp.match(/script-src[^;]*/)[0]).not.toMatch(/unsafe-inline|unsafe-eval/)
  })
  it('rewrites the API and the SPA', () => {
    expect(vercel.rewrites.some((r) => r.source.startsWith('/api/v1'))).toBe(true)
    expect(vercel.rewrites.some((r) => r.destination === '/index.html')).toBe(true)
  })
  it('hashed assets are immutable and the HTML is never cached', () => {
    expect(netlify).toMatch(/\/assets\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/)
    expect(netlify).toMatch(/\/index\.html\n\s+Cache-Control: no-cache/)
  })
  it('SPA fallback exists for Netlify', () => expect(readFileSync(`${root}public/_redirects`, 'utf8')).toMatch(/\/\*\s+\/index\.html\s+200/))
})
