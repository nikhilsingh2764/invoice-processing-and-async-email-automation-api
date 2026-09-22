import { useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search } from "lucide-react";

import { useInvoiceList } from "../../hooks/useInvoices";
import { useBusiness } from "../../hooks/useBusiness";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import PageLoader from "../../components/common/PageLoader";
import InvoiceTable from "../../components/invoice/InvoiceTable";

import { INVOICE_STATUSES } from "../../utils/constants";
import useDebouncedValue from "../../hooks/useDebouncedValue";

function Invoices() {

    const { data: business } = useBusiness();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebouncedValue(search, 400);

    const { data, isLoading, isFetching } = useInvoiceList({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        paymentStatus: status || undefined,
        sortBy,
        sortOrder,
    });

    if (isLoading) return <PageLoader label="Loading invoices…" />;

    const invoices = data?.invoices || [];
    const pagination = data?.pagination || { currentPage: 1, totalPages: 1 };

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {pagination.totalInvoices ?? invoices.length} invoice{(pagination.totalInvoices ?? invoices.length) === 1 ? "" : "s"} total
                    </p>
                </div>
                <Link to="/invoices/new">
                    <Button className="!w-auto gap-2 px-5">
                        <PlusCircle size={18} /> New invoice
                    </Button>
                </Link>
            </div>

            <Card className="p-6">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search by invoice number or customer…"
                            className="pl-10"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <Select
                        value={status}
                        className="sm:w-48"
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All statuses</option>
                        {INVOICE_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </Select>

                    <Select
                        value={`${sortBy}:${sortOrder}`}
                        className="sm:w-56"
                        onChange={(e) => {
                            const [field, order] = e.target.value.split(":");
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                    >
                        <option value="createdAt:desc">Newest first</option>
                        <option value="createdAt:asc">Oldest first</option>
                        <option value="dueDate:asc">Due date (earliest)</option>
                        <option value="dueDate:desc">Due date (latest)</option>
                        <option value="grandTotal:desc">Amount (high to low)</option>
                        <option value="grandTotal:asc">Amount (low to high)</option>
                        <option value="invoiceNumber:asc">Invoice number (A–Z)</option>
                    </Select>
                </div>

                <div className={`mt-6 ${isFetching ? "opacity-60 transition-opacity" : ""}`}>
                    <InvoiceTable
                        invoices={invoices}
                        emptyAction={
                            <Link to="/invoices/new">
                                <Button className="!w-auto px-5">Create your first invoice</Button>
                            </Link>
                        }
                    />
                </div>

                <div className="mt-4">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                    />
                </div>
            </Card>
        </div>
    );
}

export default Invoices;
