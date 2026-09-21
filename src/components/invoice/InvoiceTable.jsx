import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

import InvoiceStatusBadge from "./InvoiceStatusBadge";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

import { formatDate, formatMoney, isOverdue } from "../../utils/format";

function InvoiceTable({ invoices = [], emptyAction }) {

    const navigate = useNavigate();

    if (invoices.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="No invoices found"
                description="Try adjusting your filters, or create a new invoice."
                action={emptyAction}
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-4 py-3">Invoice</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Due date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice) => (
                        <tr
                            key={invoice._id}
                            onClick={() => navigate(`/invoices/${invoice._id}`)}
                            className="cursor-pointer border-b border-slate-50 transition last:border-0 hover:bg-slate-50"
                        >
                            <td className="px-4 py-4 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                            <td className="px-4 py-4 text-slate-600">
                                {invoice.customer?.customerName || "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                                {formatDate(invoice.dueDate)}
                                {isOverdue(invoice) && (
                                    <span className="ml-2 text-xs font-medium text-red-500">overdue</span>
                                )}
                            </td>
                            <td className="px-4 py-4">
                                <InvoiceStatusBadge status={invoice.status} />
                            </td>
                            <td className="px-4 py-4 text-right font-semibold text-slate-900">
                                {formatMoney(
                                    invoice.totalAmount ?? invoice.grandTotal,
                                    invoice.business?.currency
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default InvoiceTable;
