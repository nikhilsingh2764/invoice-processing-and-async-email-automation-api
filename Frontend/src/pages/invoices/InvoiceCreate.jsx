import InvoiceForm from "./InvoiceForm";

function InvoiceCreate() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New invoice</h1>
                <p className="mt-1 text-sm text-slate-500">Fill in the details below to create a new invoice.</p>
            </div>
            <InvoiceForm />
        </div>
    );
}

export default InvoiceCreate;
