import { useParams } from "react-router-dom";

import { useInvoice } from "../../hooks/useInvoices";
import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import { FileX } from "lucide-react";

import InvoiceForm from "./InvoiceForm";

function InvoiceEdit() {

    const { id } = useParams();
    const { data: invoice, isLoading, isError } = useInvoice(id);

    if (isLoading) return <PageLoader label="Loading invoice…" />;

    if (isError || !invoice) {
        return (
            <EmptyState
                icon={FileX}
                title="Invoice not found"
                description="This invoice may have been deleted."
            />
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Edit invoice {invoice.invoiceNumber}</h1>
                <p className="mt-1 text-sm text-slate-500">Update the details below and save your changes.</p>
            </div>
            <InvoiceForm invoice={invoice} />
        </div>
    );
}

export default InvoiceEdit;
