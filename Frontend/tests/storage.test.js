import { beforeEach, describe, expect, it } from 'vitest'

// Node has no Web Storage; jsdom does. Provide a Map-backed stand-in only when missing.
function memory() {
  const m = new Map()
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => void m.set(k, String(v)), removeItem: (k) => void m.delete(k), clear: () => m.clear() }
}
if (typeof window === 'undefined') globalThis.window = { localStorage: memory(), sessionStorage: memory() }
const { storage, STORAGE_REGISTRY } = await import('../src/lib/storage.js')

describe('storage facade', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
  it('refuses keys that are not registered', () => {
    expect(() => storage.get('ip.unknown')).toThrow(/not registered/)
    expect(() => storage.set('token', 'x')).toThrow(/not registered/)
  })
  it('round-trips a valid value', () => {
    expect(storage.set('ip.theme', 'dark')).toBe(true)
    expect(storage.get('ip.theme')).toBe('dark')
  })
  it('rejects values that fail the validator', () => {
    expect(storage.set('ip.theme', 'purple')).toBe(false)
    expect(storage.get('ip.theme')).toBeNull()
  })
  it('removes a tampered value when it is read', () => {
    window.localStorage.setItem('ip.density', 'huge')
    expect(storage.get('ip.density')).toBeNull()
    expect(window.localStorage.getItem('ip.density')).toBeNull()
  })
  it('never stores anything that looks like a JWT', () => {
    expect(storage.set('ip.returnTo', '/eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig')).toBe(false)
  })
  it('keeps returnTo in sessionStorage and validates it as a safe path', () => {
    expect(storage.set('ip.returnTo', 'https://evil.com')).toBe(false)
    expect(storage.set('ip.returnTo', '/invoices?page=2')).toBe(true)
    expect(window.sessionStorage.getItem('ip.returnTo')).toBe('/invoices?page=2')
    expect(window.localStorage.getItem('ip.returnTo')).toBeNull()
  })
  it('documents every key with purpose, category and lifetime', () => {
    for (const e of STORAGE_REGISTRY) {
      expect(e.purpose.length).toBeGreaterThan(10)
      expect(['Essential', 'Preference']).toContain(e.category)
      expect(e.lifetime.length).toBeGreaterThan(3)
    }
  })
})
