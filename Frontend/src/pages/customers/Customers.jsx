import { useMemo, useState } from "react";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";

import { useCustomers, useDeleteCustomer } from "../../hooks/useCustomers";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageLoader from "../../components/common/PageLoader";
import CustomerFormModal from "../../components/customer/CustomerFormModal";

function Customers() {

    const { data: customers = [], isLoading } = useCustomers();
    const deleteCustomer = useDeleteCustomer();

    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const filtered = useMemo(() => {

        const q = search.trim().toLowerCase();

        if (!q) return customers;

        return customers.filter((c) =>
            [c.customerName, c.email, c.companyName]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(q))
        );
    }, [customers, search]);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (customer) => {
        setEditing(customer);
        setFormOpen(true);
    };

    if (isLoading) return <PageLoader label="Loading customers…" />;

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage the people and businesses you invoice.</p>
                </div>
                <Button onClick={openCreate} className="!w-auto gap-2 px-5">
                    <Plus size={18} /> Add customer
                </Button>
            </div>

            <Card className="p-6">

                <div className="relative max-w-sm">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search customers…"
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            icon={Users}
                            title={customers.length === 0 ? "No customers yet" : "No matches"}
                            description={
                                customers.length === 0
                                    ? "Add your first customer to start creating invoices for them."
                                    : "Try a different search term."
                            }
                            action={
                                customers.length === 0 && (
                                    <Button onClick={openCreate} className="!w-auto px-5">
                                        Add customer
                                    </Button>
                                )
                            }
                        />
                    </div>
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Contact</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">City</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((customer) => (
                                    <tr key={customer._id} className="border-b border-slate-50 last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-slate-900">{customer.customerName}</p>
                                            {customer.companyName && (
                                                <p className="text-xs text-slate-400">{customer.companyName}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {customer.email}
                                            <br />
                                            <span className="text-xs text-slate-400">{customer.phone}</span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">{customer.customerType}</td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {customer.billingAddress?.city}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(customer)}
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(customer)}
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <CustomerFormModal open={formOpen} onClose={() => setFormOpen(false)} customer={editing} />

            <ConfirmDialog
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={() =>
                    deleteCustomer.mutate(deleting._id, { onSuccess: () => setDeleting(null) })
                }
                loading={deleteCustomer.isPending}
                title="Delete customer"
                description={`This will permanently delete "${deleting?.customerName}". This does not affect invoices already created for them.`}
                confirmLabel="Delete"
            />
        </div>
    );
}

export default Customers;
