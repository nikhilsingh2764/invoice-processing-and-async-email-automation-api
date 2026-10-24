// Replicates the server's invoice maths (Backend/src/helper/invoice.helper.js): every step is
// rounded to paise, then converted back. Live totals are estimates; the server has the final say.
const toPaise = (amount) => Math.round(Number(amount) * 100)
const toUnits = (paise) => Number((paise / 100).toFixed(2))

export function computeLine({ price = 0, quantity = 0, taxRate = 0, discount = 0 }) {
  const pricePaise = toPaise(price)
  const sub = Math.round(pricePaise * Number(quantity || 0))
  const disc = Math.round((sub * Number(discount || 0)) / 100)
  const taxable = sub - disc
  const tax = Math.round((taxable * Number(taxRate || 0)) / 100)
  return { sub, disc, taxable, tax, line: taxable + tax }
}

export function computeTotals(items) {
  let sub = 0
  let disc = 0
  let tax = 0
  const lines = items.map((item) => {
    const l = computeLine(item)
    sub += l.sub
    disc += l.disc
    tax += l.tax
    return { ...l, lineTotal: toUnits(l.line), subTotal: toUnits(l.sub), discount: toUnits(l.disc), tax: toUnits(l.tax) }
  })
  return { lines, subTotal: toUnits(sub), totalDiscount: toUnits(disc), totalTax: toUnits(tax), grandTotal: toUnits(sub - disc + tax) }
}

/** The backend increments the counter before use, so the first invoice is PREFIX-(start+1). */
export function nextInvoiceNumber(prefix, start, issued = 0) {
  const p = String(prefix || 'INV').trim().toUpperCase() || 'INV'
  const s = Number.isFinite(Number(start)) ? Number(start) : 1
  return `${p}-${s + 1 + issued}`
}
