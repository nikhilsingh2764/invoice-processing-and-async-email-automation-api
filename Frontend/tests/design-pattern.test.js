import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8')

// The "Invoice Document" pattern is a rule, so the rule is a test.
describe('Invoice Document pattern', () => {
  it('detail page uses all six zones', () => {
    const page = read('pages/app/InvoiceDetail.jsx')
    for (const piece of ['Letterhead', 'MetaStrip', 'Party', 'Ledger', 'Totals', 'Perforation', 'Stamp']) expect(page.includes(piece)).toBe(true)
  })
  it('every app page opens with a Letterhead (zone 1)', () => {
    for (const f of ['Dashboard', 'InvoiceList', 'InvoiceForm', 'InvoiceDetail', 'Customers', 'Products', 'Business', 'Account'].map((n) => `pages/app/${n}.jsx`)) {
      const src = f.includes('Customers') || f.includes('Products') ? read('components/app/ResourcePage.jsx') : read(f)
      expect(src.includes('Letterhead')).toBe(true)
    }
  })
  it('uses at most one signature element per page', () => {
    // fold + stamp are both on the detail sheet by design (stamp is part of the document); stacks and folds never combine on one element.
    for (const f of ['Dashboard', 'InvoiceList', 'Customers', 'Account']) {
      const src = f === 'Customers' ? read('components/app/ResourcePage.jsx') : read(`pages/app/${f}.jsx`)
      const signatures = ['fold', 'stack', 'Stamp', 'Perforation'].filter((s) => new RegExp(`<Sheet[^>]*\\b${s}\\b|<${s}\\b`).test(src))
      expect(signatures.length).toBeLessThanOrEqual(1)
    }
  })
  it('money and tabular figures: totals use tabular numerals', () => expect(readFileSync(new URL('../src/theme/patterns.css', import.meta.url), 'utf8')).toMatch(/tabular-nums/))
})
