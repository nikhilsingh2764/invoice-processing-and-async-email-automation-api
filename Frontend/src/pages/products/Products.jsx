import { useMemo, useState } from "react";
import { Package, Plus, Pencil, Trash2, Search } from "lucide-react";

import { useProducts, useDeleteProduct } from "../../hooks/useProducts";
import { useBusiness } from "../../hooks/useBusiness";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageLoader from "../../components/common/PageLoader";
import ProductFormModal from "../../components/product/ProductFormModal";

import { formatMoney } from "../../utils/format";

function Products() {

    const { data: products = [], isLoading } = useProducts();
    const { data: business } = useBusiness();
    const deleteProduct = useDeleteProduct();

    const [search, setSearch] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const currency = business?.currency || "INR";

    const filtered = useMemo(() => {

        const q = search.trim().toLowerCase();

        if (!q) return products;

        return products.filter((p) =>
            [p.productName, p.category].filter(Boolean).some((f) => f.toLowerCase().includes(q))
        );
    }, [products, search]);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setFormOpen(true);
    };

    if (isLoading) return <PageLoader label="Loading products…" />;

    return (
        <div className="space-y-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Products & services</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        These are the line items you can add to an invoice.
                    </p>
                </div>
                <Button onClick={openCreate} className="!w-auto gap-2 px-5">
                    <Plus size={18} /> Add product
                </Button>
            </div>

            <Card className="p-6">

                <div className="relative max-w-sm">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search products…"
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            icon={Package}
                            title={products.length === 0 ? "No products yet" : "No matches"}
                            description={
                                products.length === 0
                                    ? "Add a product or service so you can start building invoices."
                                    : "Try a different search term."
                            }
                            action={
                                products.length === 0 && (
                                    <Button onClick={openCreate} className="!w-auto px-5">
                                        Add product
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
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Tax / Discount</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((product) => (
                                    <tr key={product._id} className="border-b border-slate-50 last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-slate-900">{product.productName}</p>
                                            <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">{product.category}</td>
                                        <td className="px-4 py-4 text-right font-medium text-slate-900">
                                            {formatMoney(product.price, currency)}
                                            <span className="text-xs font-normal text-slate-400"> /{product.unit}</span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-slate-600">
                                            {product.taxRate || 0}% / {product.discount || 0}%
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(product)}
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleting(product)}
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

            <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editing} />

            <ConfirmDialog
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                onConfirm={() =>
                    deleteProduct.mutate(deleting._id, { onSuccess: () => setDeleting(null) })
                }
                loading={deleteProduct.isPending}
                title="Delete product"
                description={`This will permanently delete "${deleting?.productName}". This does not affect invoices already created with it.`}
                confirmLabel="Delete"
            />
        </div>
    );
}

export default Products;
