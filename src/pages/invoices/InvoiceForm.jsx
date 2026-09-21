import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/ui/EmptyState";

import InvoiceItemsEditor, { computeInvoiceTotals } from "../../components/invoice/InvoiceItemsEditor";

import { useCustomers } from "../../hooks/useCustomers";
import { useProducts } from "../../hooks/useProducts";
import { useBusiness } from "../../hooks/useBusiness";
import { useSaveInvoice } from "../../hooks/useInvoices";

import { INVOICE_STATUSES, PAYMENT_METHODS } from "../../utils/constants";
import { formatDateInput, formatMoney } from "../../utils/format";
import { FileText, Building2 } from "lucide-react";

// Shared form for both "create invoice" and "edit invoice". `invoice` is
// undefined for create mode, or the full invoice document for edit mode.
function InvoiceForm({ invoice }) {

    const navigate = useNavigate();

    const { data: business, isLoading: loadingBusiness } = useBusiness();
    const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
    const { data: products = [], isLoading: loadingProducts } = useProducts();

    const saveInvoice = useSaveInvoice();

    const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

    // The invoice document only stores a *snapshot* of the customer (name,
    // email, address, etc.) — it does not persist the original customerId
    // (Backend/src/model/invoice/invoice.model.js). So when editing, we
    // best-effort match the snapshot back to a live customer by email so
    // the dropdown is pre-selected; if no match is found (e.g. the
    // customer was deleted), the field is left for the user to re-select.
    const matchedCustomerId = useMemo(() => {

        if (!invoice?.customer?.email) return "";

        const match = customers.find((c) => c.email === invoice.customer.email);

        return match?._id || "";

    }, [invoice, customers]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        values: {
            customerId: matchedCustomerId,
            dueDate: formatDateInput(invoice?.dueDate) || formatDateInput(new Date(Date.now() + 7 * 86400000)),
            status: invoice?.status || "Draft",
            paymentMethod: invoice?.paymentMethod || "",
            notes: invoice?.notes || "",
            termsAndConditions: invoice?.termsAndConditions ?? business?.termsAndConditions ?? "",
        },
    });

    useEffect(() => {

        if (invoice?.items?.length) {
            setItems(invoice.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
        }
    }, [invoice]);

    const totals = useMemo(() => computeInvoiceTotals(items, products), [items, products]);

    const loading = loadingBusiness || loadingCustomers || loadingProducts;

    if (loading) return <PageLoader label="Loading invoice form…" />;

    if (!business) {
        return (
            <EmptyState
                icon={Building2}
                title="Set up your business profile first"
                description="Invoices are created from your business profile — the backend requires one before it can generate an invoice number."
                action={
                    <Button onClick={() => navigate("/business")} className="!w-auto px-5">
                        Go to business profile
                    </Button>
                }
            />
        );
    }

    if (customers.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="Add a customer first"
                description="You need at least one customer before you can create an invoice."
                action={
                    <Button onClick={() => navigate("/customers")} className="!w-auto px-5">
                        Go to customers
                    </Button>
                }
            />
        );
    }

    if (products.length === 0) {
        return (
            <EmptyState
                icon={FileText}
                title="Add a product first"
                description="You need at least one product or service before you can create an invoice."
                action={
                    <Button onClick={() => navigate("/products")} className="!w-auto px-5">
                        Go to products
                    </Button>
                }
            />
        );
    }

    const onSubmit = (values) => {

        const validItems = items.filter((i) => i.productId && i.quantity > 0);

        if (validItems.length === 0) {
            toast.error("Add at least one product to the invoice");
            return;
        }

        const payload = {
            customerId: values.customerId,
            items: validItems.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })),
            dueDate: values.dueDate,
            status: values.status || undefined,
            paymentMethod: values.paymentMethod || undefined,
            notes: values.notes || undefined,
            termsAndConditions: values.termsAndConditions || undefined,
        };

        saveInvoice.mutate(
            { id: invoice?._id, data: payload },
            {
                onSuccess: (res) => {
                    navigate(`/invoices/${res.data._id}`);
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <Card className="space-y-4 p-6">
                <h3 className="text-sm font-semibold text-slate-700">Invoice details</h3>

                {invoice && invoice.customer && !matchedCustomerId && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        This invoice was originally billed to <strong>{invoice.customer.customerName}</strong>, who
                        no longer matches a saved customer. Please re-select a customer below.
                    </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Select
                        label="Customer"
                        error={errors.customerId?.message}
                        {...register("customerId", { required: "Select a customer" })}
                    >
                        <option value="" disabled>Select a customer</option>
                        {customers.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.customerName}{c.companyName ? ` — ${c.companyName}` : ""}
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Due date"
                        type="date"
                        error={errors.dueDate?.message}
                        {...register("dueDate", { required: "Due date is required" })}
                    />

                    <Select label="Status" {...register("status")}>
                        {INVOICE_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </Select>

                    <Select label="Payment method (optional)" {...register("paymentMethod")}>
                        <option value="">Not specified</option>
                        {PAYMENT_METHODS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </Select>
                </div>
            </Card>

            <Card className="space-y-4 p-6">
                <h3 className="text-sm font-semibold text-slate-700">Line items</h3>
                <InvoiceItemsEditor items={items} onChange={setItems} products={products} currency={business.currency} />

                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between text-slate-500">
                            <span>Subtotal</span>
                            <span>{formatMoney(totals.subTotal, business.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Discount</span>
                            <span>−{formatMoney(totals.totalDiscount, business.currency)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Tax</span>
                            <span>+{formatMoney(totals.totalTax, business.currency)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                            <span>Grand total</span>
                            <span>{formatMoney(totals.grandTotal, business.currency)}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="space-y-4 p-6">
                <h3 className="text-sm font-semibold text-slate-700">Notes & terms</h3>
                <Textarea label="Notes (optional)" {...register("notes")} />
                <Textarea label="Terms & conditions (optional)" rows={4} {...register("termsAndConditions")} />
            </Card>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="rounded-lg px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100"
                >
                    Cancel
                </button>
                <Button type="submit" loading={saveInvoice.isPending} className="!w-auto px-6">
                    {invoice ? "Save changes" : "Create invoice"}
                </Button>
            </div>
        </form>
    );
}

export default InvoiceForm;
