import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { formatDate, formatMoney } from "../../utils/format";

// A print-ready, professional invoice layout driven entirely by the
// snapshot data the backend stores on the invoice document itself
// (business + customer snapshots, line items, computed totals) —
// see Backend/src/model/invoice/invoice.model.js.
function InvoicePreview({ invoice }) {

    if (!invoice) return null;

    const { business, customer, items = [] } = invoice;
    const currency = business?.currency || "INR";

    return (
        <div
            id="invoice-preview"
            className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 print:rounded-none print:shadow-none print:ring-0 sm:p-10"
        >
            {/* Header */}
            <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-8 sm:flex-row sm:items-start">

                <div className="flex items-start gap-4">
                    {business?.logo && (
                        <img
                            src={business.logo}
                            alt={business.businessName}
                            className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                    )}

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{business?.businessName}</h2>
                        <p className="text-sm text-slate-500">{business?.ownerName}</p>
                        <p className="mt-2 max-w-xs text-sm text-slate-500">
                            {business?.address?.addressLine1}
                            {business?.address?.addressLine2 ? `, ${business.address.addressLine2}` : ""}
                            <br />
                            {business?.address?.city}, {business?.address?.state} {business?.address?.postalCode}
                            <br />
                            {business?.address?.country}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            {business?.email} · {business?.phone}
                        </p>
                        {business?.gstNumber && (
                            <p className="text-sm text-slate-500">GSTIN: {business.gstNumber}</p>
                        )}
                    </div>
                </div>

                <div className="text-left sm:text-right">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">INVOICE</h1>
                    <p className="mt-1 font-mono text-sm text-slate-500">{invoice.invoiceNumber}</p>

                    <div className="mt-3">
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>

                    <dl className="mt-4 space-y-1 text-sm">
                        <div className="flex justify-between gap-6 sm:justify-end">
                            <dt className="text-slate-400">Invoice date</dt>
                            <dd className="font-medium text-slate-700">{formatDate(invoice.invoiceDate)}</dd>
                        </div>
                        <div className="flex justify-between gap-6 sm:justify-end">
                            <dt className="text-slate-400">Due date</dt>
                            <dd className="font-medium text-slate-700">{formatDate(invoice.dueDate)}</dd>
                        </div>
                        {invoice.paymentMethod && (
                            <div className="flex justify-between gap-6 sm:justify-end">
                                <dt className="text-slate-400">Payment method</dt>
                                <dd className="font-medium text-slate-700">{invoice.paymentMethod}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            {/* Bill to */}
            <div className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bill to</p>
                    <p className="mt-2 font-semibold text-slate-900">{customer?.customerName}</p>
                    {customer?.companyName && <p className="text-sm text-slate-500">{customer.companyName}</p>}
                    <p className="mt-1 text-sm text-slate-500">
                        {customer?.billingAddress?.addressLine1}
                        {customer?.billingAddress?.addressLine2 ? `, ${customer.billingAddress.addressLine2}` : ""}
                        <br />
                        {customer?.billingAddress?.city}, {customer?.billingAddress?.state}{" "}
                        {customer?.billingAddress?.postalCode}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        {customer?.email} · {customer?.phone}
                    </p>
                    {customer?.gstNumber && (
                        <p className="text-sm text-slate-500">GSTIN: {customer.gstNumber}</p>
                    )}
                </div>

                {customer?.shippingAddress?.addressLine1 && (
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ship to</p>
                        <p className="mt-2 text-sm text-slate-500">
                            {customer.shippingAddress.addressLine1}
                            {customer.shippingAddress.addressLine2 ? `, ${customer.shippingAddress.addressLine2}` : ""}
                            <br />
                            {customer.shippingAddress.city}, {customer.shippingAddress.state}{" "}
                            {customer.shippingAddress.postalCode}
                        </p>
                    </div>
                )}
            </div>

            {/* Items table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[560px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3 text-right">Qty</th>
                            <th className="px-4 py-3 text-right">Unit price</th>
                            <th className="px-4 py-3 text-right">Discount</th>
                            <th className="px-4 py-3 text-right">Tax</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} className="border-b border-slate-50 last:border-0">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-800">{item.productName}</p>
                                    {item.description && (
                                        <p className="text-xs text-slate-400">{item.description}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                    {item.quantity} {item.unit}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">
                                    {formatMoney(item.price, currency)}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-600">{item.discount || 0}%</td>
                                <td className="px-4 py-3 text-right text-slate-600">{item.taxRate || 0}%</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                    {formatMoney(item.lineTotal, currency)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-700">{formatMoney(invoice.subTotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Discount</span>
                        <span className="font-medium text-slate-700">
                            −{formatMoney(invoice.totalDiscount, currency)}
                        </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                        <span>Tax</span>
                        <span className="font-medium text-slate-700">+{formatMoney(invoice.totalTax, currency)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
                        <span>Grand total</span>
                        <span>{formatMoney(invoice.grandTotal, currency)}</span>
                    </div>
                </div>
            </div>

            {/* Notes / terms / signature */}
            {(invoice.notes || invoice.termsAndConditions || business?.signature) && (
                <div className="mt-10 grid grid-cols-1 gap-8 border-t border-slate-100 pt-8 sm:grid-cols-2">
                    <div className="space-y-4">
                        {invoice.notes && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
                                <p className="mt-1 text-sm text-slate-600">{invoice.notes}</p>
                            </div>
                        )}
                        {invoice.termsAndConditions && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Terms &amp; conditions
                                </p>
                                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                                    {invoice.termsAndConditions}
                                </p>
                            </div>
                        )}
                    </div>

                    {business?.signature && (
                        <div className="flex flex-col items-end justify-end text-right">
                            <img src={business.signature} alt="Signature" className="h-16 object-contain" />
                            <p className="mt-2 border-t border-slate-200 pt-2 text-sm text-slate-500">
                                Authorized signatory
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default InvoicePreview;
