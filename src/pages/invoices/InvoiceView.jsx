import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Copy,
    Download,
    FileX,
    Mail,
    Pencil,
    Trash2,
} from "lucide-react";

import {
    useDeleteInvoice,
    useDuplicateInvoice,
    useInvoice,
    useInvoicePDF,
    useSendInvoiceEmail,
} from "../../hooks/useInvoices";

import PageLoader from "../../components/common/PageLoader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import InvoicePreview from "../../components/invoice/InvoicePreview";

function InvoiceView() {

    const { id } = useParams();
    const navigate = useNavigate();

    const { data: invoice, isLoading, isError } = useInvoice(id);

    const { download, status: pdfStatus } = useInvoicePDF();
    const sendEmail = useSendInvoiceEmail();
    const duplicateInvoice = useDuplicateInvoice();
    const deleteInvoice = useDeleteInvoice();

    const [confirmDelete, setConfirmDelete] = useState(false);

    if (isLoading) return <PageLoader label="Loading invoice…" />;

    if (isError || !invoice) {
        return (
            <EmptyState
                icon={FileX}
                title="Invoice not found"
                description="This invoice may have been deleted, or the link is incorrect."
                action={
                    <Link to="/invoices">
                        <Button className="!w-auto px-5">Back to invoices</Button>
                    </Link>
                }
            />
        );
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6 pb-16">

            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <button
                    onClick={() => navigate("/invoices")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                    <ArrowLeft size={16} /> Back to invoices
                </button>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => download(invoice._id, invoice.invoiceNumber)}
                        loading={pdfStatus === "generating"}
                        className="!w-auto gap-2 bg-slate-800 px-4 hover:bg-slate-900"
                    >
                        <Download size={16} /> Download PDF
                    </Button>

                    <Button
                        onClick={() => sendEmail.mutate(invoice._id)}
                        loading={sendEmail.isPending}
                        className="!w-auto gap-2 bg-slate-800 px-4 hover:bg-slate-900"
                    >
                        <Mail size={16} /> Email to customer
                    </Button>

                    <button
                        onClick={() => duplicateInvoice.mutate(invoice._id)}
                        disabled={duplicateInvoice.isPending}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        <Copy size={16} /> Duplicate
                    </button>

                    <button
                        onClick={() => navigate(`/invoices/${invoice._id}/edit`)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        <Pencil size={16} /> Edit
                    </button>

                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            </div>

            <InvoicePreview invoice={invoice} />

            <ConfirmDialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={() =>
                    deleteInvoice.mutate(invoice._id, {
                        onSuccess: () => navigate("/invoices"),
                    })
                }
                loading={deleteInvoice.isPending}
                title="Delete invoice"
                description={`This will permanently delete invoice "${invoice.invoiceNumber}". This cannot be undone.`}
                confirmLabel="Delete"
            />
        </div>
    );
}

export default InvoiceView;
