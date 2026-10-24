import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = new URL('../src', import.meta.url).pathname
const files = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(jsx?|css)$/.test(name)) files.push(p)
  }
}
walk(SRC)
const code = files.filter((f) => /\.jsx?$/.test(f))
const read = (f) => readFileSync(f, 'utf8')
const rel = (f) => relative(SRC, f)
const offenders = (re, { except = [] } = {}) => code.filter((f) => !except.includes(rel(f)) && re.test(read(f))).map(rel)

describe('source scan (security rules enforced as tests)', () => {
  it('has source files to scan', () => expect(code.length).toBeGreaterThan(50))
  it('touches localStorage / sessionStorage only inside lib/storage.js', () => expect(offenders(/\b(localStorage|sessionStorage)\s*(\.|\[)/, { except: ['lib/storage.js'] })).toEqual([]))
  it('never uses dangerouslySetInnerHTML, innerHTML, eval or new Function', () => {
    expect(offenders(/dangerouslySetInnerHTML/)).toEqual([])
    expect(offenders(/\.innerHTML\s*=(?!=)/, { except: ['components/ui/GoogleButton.jsx'] })).toEqual([])
    expect(offenders(/\beval\(|new Function\(/)).toEqual([])
  })
  it('has no console calls in app code (the report helper is the single sink)', () => expect(offenders(/\bconsole\.(log|debug|info|warn|error)\(/, { except: ['lib/report.js'] })).toEqual([]))
  it('opens every target=_blank link with rel noopener', () => {
    const bad = code.filter((f) => [...read(f).matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].some((m) => !/noopener/.test(m[0]))).map(rel)
    // Internal <Link target="_blank"> is handled by react-router, which adds rel itself only for anchors; flag raw anchors only.
    expect(bad).toEqual([])
  })
  it('never puts tokens or passwords into storage, URLs or logs', () => {
    expect(offenders(/(setItem|storage\.set)\([^)]*(token|password)/i)).toEqual([])
    expect(offenders(/state:\s*\{[^}]*\b(password|newPassword|oldPassword|confirmPassword)\s*:/)).toEqual([])
  })
  it('does not load third-party fonts or scripts from CSS or JS', () => {
    expect(files.filter((f) => /fonts\.googleapis|fonts\.gstatic|cdn\./.test(read(f))).map(rel)).toEqual([])
  })
  it('only references storage keys that are registered', async () => {
    const { STORAGE_REGISTRY } = await import('../src/lib/storage.js')
    const known = new Set(STORAGE_REGISTRY.map((e) => e.key))
    const used = new Set()
    for (const f of code) for (const m of read(f).matchAll(/['"`](ip\.[a-zA-Z.]+)['"`]/g)) used.add(m[1])
    expect([...used].filter((k) => !known.has(k))).toEqual([])
  })
  it('keeps recharts inside the lazy charts module', () => expect(offenders(/from 'recharts'/, { except: ['components/charts/Charts.jsx'] })).toEqual([]))
})
