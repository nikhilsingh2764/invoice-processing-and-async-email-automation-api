import { describe, expect, it } from 'vitest'
import { computeLine, computeTotals, nextInvoiceNumber } from '../src/lib/money.js'

describe('invoice maths (mirrors the server)', () => {
  it('rounds every step to paise', () => {
    const t = computeTotals([{ price: 100.5, quantity: 3, taxRate: 18, discount: 10 }])
    expect(t.subTotal).toBe(301.5)
    expect(t.totalDiscount).toBe(30.15)
    expect(t.totalTax).toBe(48.84)
    expect(t.grandTotal).toBe(320.19)
  })
  it('handles zero, empty and undefined values', () => {
    expect(computeTotals([]).grandTotal).toBe(0)
    expect(computeLine({}).line).toBe(0)
    expect(computeTotals([{ price: 10, quantity: 0 }]).grandTotal).toBe(0)
  })
  it('avoids floating point drift', () => {
    expect(computeTotals([{ price: 0.1, quantity: 3 }]).grandTotal).toBe(0.3)
    expect(computeTotals([{ price: 19.99, quantity: 7, taxRate: 5 }]).grandTotal).toBe(146.93)
  })
  it('totals several lines', () => {
    const t = computeTotals([{ price: 100, quantity: 2, taxRate: 18 }, { price: 50, quantity: 1, discount: 20 }])
    expect(t.grandTotal).toBe(276)
    expect(t.lines).toHaveLength(2)
  })
})

describe('nextInvoiceNumber', () => {
  it('is prefix-(start+1) for the first invoice', () => expect(nextInvoiceNumber('inv', 1000)).toBe('INV-1001'))
  it('defaults sensibly', () => expect(nextInvoiceNumber('', undefined)).toBe('INV-2'))
  it('counts issued invoices', () => expect(nextInvoiceNumber('ABC', 5, 2)).toBe('ABC-8'))
})
