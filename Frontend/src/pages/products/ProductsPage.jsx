import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchBox from '../../components/common/ResourceToolbar';
import ProductFormModal from '../../components/product/ProductFormModal';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import Pagination from '../../components/tables/Pagination';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import { SkeletonRows } from '../../components/feedback/Skeleton';
import { useToast } from '../../components/feedback/toast-context';
import { useBusiness, useProducts } from '../../hooks/queries';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { deleteProduct } from '../../api/product.api';
import { getErrorMessage } from '../../lib/errors';
import { formatMoney } from '../../lib/format';
import { keys } from '../../lib/queryKeys';

export default function ProductsPage() {
  useDocumentTitle('Products');
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data, error, isPending, isFetching, refetch } = useProducts();
  const currency = useBusiness().data?.currency;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...(data ?? [])].sort((a, b) => a.productName.localeCompare(b.productName));
    return q ? rows.filter((p) => [p.productName, p.category, p.description].some((v) => v?.toLowerCase().includes(q))) : rows;
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * limit, safePage * limit);

  const del = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: keys.products }); toast.success('Product deleted.'); setDeleting(null); },
    onError: (e) => { toast.error(getErrorMessage(e)); setDeleting(null); },
  });

  return (
    <>
      <PageHeader title="Products" description="Items and services you add to invoices."
        actions={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> Add product</Button>} />
      <Card>
        <div className="border-b border-line p-4 sm:p-5">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, category or description…" />
        </div>
        {isPending ? <SkeletonRows rows={6} />
          : error ? <ErrorState title="We couldn’t load products" error={error} onRetry={refetch} retrying={isFetching} />
          : (data ?? []).length === 0 ? (
            <EmptyState icon={Package} title="No products yet" description="Add the products or services you sell."
              action={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> Add product</Button>} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No products match your search" />
          ) : (
            <>
              <ul className="divide-y divide-line">
                {rows.map((p) => (
                  <li key={p._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                    <div className="min-w-0 flex-1 basis-64">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-fg" title={p.productName}>{p.productName}</p>
                        <Badge>{p.category}</Badge>
                      </div>
                      <p className="mt-0.5 line-clamp-1 break-words text-sm text-fg-muted">{p.description}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold tabular-nums text-fg">{formatMoney(p.price, currency)} <span className="font-normal text-fg-muted">/ {p.unit}</span></p>
                      <p className="text-xs text-fg-muted">{p.taxRate}% tax · {p.discount}% discount</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(p)} aria-label={`Edit ${p.productName}`}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(p)} aria-label={`Delete ${p.productName}`}><Trash2 className="size-4 text-danger" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={safePage} totalPages={totalPages} total={filtered.length} limit={limit} noun="products" onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} />
            </>
          )}
      </Card>
      {editing && <ProductFormModal open product={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} title="Delete this product?" message={`${deleting?.productName ?? 'This product'} will be removed. Existing invoices keep their copy of it.`}
        confirmLabel="Delete product" loading={del.isPending} onConfirm={() => del.mutate(deleting._id)} onCancel={() => setDeleting(null)} />
    </>
  );
}
