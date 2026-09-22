import { Plus, Trash2 } from "lucide-react";

import Select from "../ui/Select";
import Input from "../ui/Input";

import { formatMoney } from "../../utils/format";

// Recomputes the same per-line math as
// Backend/src/helper/invoice.helper.js#buildInvoiceItems, purely so the
// user sees an accurate live preview before submitting. The backend is
// still the source of truth: only productId + quantity are ever sent.
export const computeLineTotal = (product, quantity) => {

    if (!product || !quantity) return 0;

    const itemSubTotal = product.price * quantity;
    const discountAmount = (itemSubTotal * (product.discount || 0)) / 100;
    const taxableAmount = itemSubTotal - discountAmount;
    const taxAmount = (taxableAmount * (product.taxRate || 0)) / 100;

    return taxableAmount + taxAmount;
};

export const computeInvoiceTotals = (items, products) => {

    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach(({ productId, quantity }) => {

        const product = products.find((p) => p._id === productId);
        if (!product || !quantity) return;

        const itemSubTotal = product.price * quantity;
        const discountAmount = (itemSubTotal * (product.discount || 0)) / 100;
        const taxableAmount = itemSubTotal - discountAmount;
        const taxAmount = (taxableAmount * (product.taxRate || 0)) / 100;

        subTotal += itemSubTotal;
        totalDiscount += discountAmount;
        totalTax += taxAmount;
    });

    return {
        subTotal,
        totalDiscount,
        totalTax,
        grandTotal: subTotal - totalDiscount + totalTax,
    };
};

function InvoiceItemsEditor({ items, onChange, products, currency }) {

    const updateItem = (index, patch) => {
        const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
        onChange(next);
    };

    const addItem = () => {
        onChange([...items, { productId: "", quantity: 1 }]);
    };

    const removeItem = (index) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">

            <div className="hidden grid-cols-12 gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid">
                <span className="col-span-6">Product</span>
                <span className="col-span-2">Quantity</span>
                <span className="col-span-3">Line total</span>
                <span className="col-span-1"></span>
            </div>

            {items.map((item, index) => {

                const product = products.find((p) => p._id === item.productId);
                const lineTotal = computeLineTotal(product, item.quantity);

                return (
                    <div
                        key={index}
                        className="grid grid-cols-1 items-start gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-12 sm:items-center sm:border-0 sm:p-0"
                    >
                        <div className="sm:col-span-6">
                            <Select
                                value={item.productId}
                                onChange={(e) => updateItem(index, { productId: e.target.value })}
                            >
                                <option value="" disabled>Select a product</option>
                                {products.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.productName} — {formatMoney(p.price, currency)}/{p.unit}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="sm:col-span-2">
                            <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                    updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })
                                }
                            />
                        </div>

                        <div className="text-sm font-semibold text-slate-900 sm:col-span-3">
                            {formatMoney(lineTotal, currency)}
                            {product && (
                                <p className="text-xs font-normal text-slate-400">
                                    {product.discount || 0}% off · {product.taxRate || 0}% tax
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-1 sm:text-right">
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                );
            })}

            <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
                <Plus size={16} /> Add another product
            </button>

        </div>
    );
}

export default InvoiceItemsEditor;
