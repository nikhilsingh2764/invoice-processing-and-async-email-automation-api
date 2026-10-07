// Mirrors backend `buildInvoiceItems` so the form can show a live ESTIMATE.
// The server always recalculates and stores the authoritative totals.
export function lineAmounts(product, quantity) {
  const qty = Number(quantity);
  if (!product || !Number.isFinite(qty) || qty < 1) return { sub: 0, discount: 0, tax: 0, total: 0 };
  const sub = product.price * qty;
  const discount = (sub * (product.discount || 0)) / 100;
  const tax = ((sub - discount) * (product.taxRate || 0)) / 100;
  return { sub, discount, tax, total: sub - discount + tax };
}

export function estimateTotals(items, productsById) {
  const totals = { subTotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0 };
  for (const item of items) {
    const l = lineAmounts(productsById.get(item.productId), item.quantity);
    totals.subTotal += l.sub;
    totals.totalDiscount += l.discount;
    totals.totalTax += l.tax;
    totals.grandTotal += l.total;
  }
  return totals;
}
