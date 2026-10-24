import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

const dir = new URL('../src/theme/', import.meta.url).pathname
const css = Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => [f, readFileSync(dir + f, 'utf8')]))
const defined = new Set()
for (const text of Object.values(css)) for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1])
// Set inline from components (style={{ '--i': n }}), so they have no :root definition.
const INLINE = new Set(['--i', '--w', '--toast-ms'])
const TAILWIND = /^--(tw-|color-|font-|radius-|shadow-|ease-|breakpoint-|animate-|spacing)/

describe('design tokens', () => {
  it('every var(--x) used in the theme is defined somewhere', () => {
    const missing = new Set()
    for (const [file, text] of Object.entries(css)) for (const m of text.matchAll(/var\((--[\w-]+)/g)) if (!defined.has(m[1]) && !TAILWIND.test(m[1]) && !INLINE.has(m[1])) missing.add(`${file}: ${m[1]}`)
    expect([...missing]).toEqual([])
  })
  it('declares light and dark palettes with the same semantic names', () => {
    const tokens = css['tokens.css']
    const dark = tokens.slice(tokens.indexOf("[data-theme='dark']"))
    for (const name of ['--surface', '--text', '--muted', '--brand', '--danger', '--st-paid']) expect(dark.includes(`${name}:`)).toBe(true)
  })
  it('respects reduced motion', () => expect(css['motion.css']).toMatch(/prefers-reduced-motion: reduce/))
  it('keeps layers in the declared order', () => expect(readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')).toMatch(/@layer theme, tokens, base, components, utilities/))
  it('every pattern class used by the sheet components exists in CSS', () => {
    const all = Object.values(css).join('\n')
    for (const c of ['.sheet', '.letterhead', '.meta-strip', '.parties', '.ledger', '.totals', '.stamp', '.perforation', '.sheet-fold', '.paper-stack']) expect(all.includes(c)).toBe(true)
  })
})
