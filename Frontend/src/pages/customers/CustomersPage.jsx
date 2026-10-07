import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Pencil, Phone, Plus, Trash2, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchBox from '../../components/common/ResourceToolbar';
import CustomerFormModal from '../../components/customer/CustomerFormModal';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import Pagination from '../../components/tables/Pagination';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import { SkeletonRows } from '../../components/feedback/Skeleton';
import { useToast } from '../../components/feedback/toast-context';
import { useCustomers } from '../../hooks/queries';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { deleteCustomer } from '../../api/customer.api';
import { getErrorMessage } from '../../lib/errors';
import { keys } from '../../lib/queryKeys';

export default function CustomersPage() {
  useDocumentTitle('Customers');
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data, error, isPending, isFetching, refetch } = useCustomers();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState(null); // null | 'new' | customer
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...(data ?? [])].sort((a, b) => a.customerName.localeCompare(b.customerName));
    return q ? rows.filter((c) => [c.customerName, c.email, c.companyName, c.phone].some((v) => v?.toLowerCase().includes(q))) : rows;
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * limit, safePage * limit);

  const del = useMutation({
    mutationFn: (id) => deleteCustomer(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: keys.customers }); toast.success('Customer deleted.'); setDeleting(null); },
    onError: (e) => { toast.error(getErrorMessage(e)); setDeleting(null); },
  });

  return (
    <>
      <PageHeader title="Customers" description="People and companies you invoice."
        actions={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> Add customer</Button>} />
      <Card>
        <div className="border-b border-line p-4 sm:p-5">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email, company or phone…" />
        </div>
        {isPending ? <SkeletonRows rows={6} />
          : error ? <ErrorState title="We couldn’t load customers" error={error} onRetry={refetch} retrying={isFetching} />
          : (data ?? []).length === 0 ? (
            <EmptyState icon={Users} title="No customers yet" description="Add a customer so you can start invoicing them."
              action={<Button onClick={() => setEditing('new')}><Plus className="size-4" aria-hidden /> Add customer</Button>} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No customers match your search" description="Try a different name, email or phone number." />
          ) : (
            <>
              <ul className="divide-y divide-line">
                {rows.map((c) => (
                  <li key={c._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                    <div className="min-w-0 flex-1 basis-64">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-fg" title={c.customerName}>{c.customerName}</p>
                        <Badge tone={c.customerType === 'Business' ? 'brand' : 'neutral'}>{c.customerType?.trim()}</Badge>
                      </div>
                      {c.companyName && <p className="truncate text-sm text-fg-muted">{c.companyName}</p>}
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-muted">
                        <span className="inline-flex min-w-0 items-center gap-1.5"><Mail className="size-3.5 shrink-0" aria-hidden /><span className="truncate">{c.email}</span></span>
                        <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5 shrink-0" aria-hidden />{c.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={`Edit ${c.customerName}`}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(c)} aria-label={`Delete ${c.customerName}`}><Trash2 className="size-4 text-danger" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={safePage} totalPages={totalPages} total={filtered.length} limit={limit} noun="customers" onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} />
            </>
          )}
      </Card>
      {editing && <CustomerFormModal open customer={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} title="Delete this customer?" message={`${deleting?.customerName ?? 'This customer'} will be removed. Existing invoices keep a copy of their details.`}
        confirmLabel="Delete customer" loading={del.isPending} onConfirm={() => del.mutate(deleting._id)} onCancel={() => setDeleting(null)} />
    </>
  );
}
