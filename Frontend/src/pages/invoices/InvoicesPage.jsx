import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Search, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { buttonClasses } from '../../components/common/button-styles';
import Select from '../../components/forms/Select';
import Input from '../../components/forms/Input';
import InvoiceTable from '../../components/invoice/InvoiceTable';
import { useInvoiceActions } from '../../components/invoice/useInvoiceActions';
import Pagination from '../../components/tables/Pagination';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import { SkeletonRows } from '../../components/feedback/Skeleton';
import { useBusiness, useDashboard } from '../../hooks/queries';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { INVOICE_SORT_FIELDS, INVOICE_STATUSES } from '../../lib/constants';

const DEFAULTS = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };

export default function InvoicesPage() {
  useDocumentTitle('Invoices');
  const [sp, setSp] = useSearchParams();
  const [searchText, setSearchText] = useState(sp.get('search') ?? '');
  const debouncedSearch = useDebouncedValue(searchText, 400);

  const params = {
    page: Number(sp.get('page')) || DEFAULTS.page,
    limit: Number(sp.get('limit')) || DEFAULTS.limit,
    sortBy: sp.get('sortBy') || DEFAULTS.sortBy,
    sortOrder: sp.get('sortOrder') === 'asc' ? 'asc' : 'desc',
    search: sp.get('search') || '',
    paymentStatus: sp.get('status') || '',
    startDate: sp.get('from') || '',
    endDate: sp.get('to') || '',
  };

  // Reflect the debounced search box into the URL (and reset to page 1) — computed during render, no effect.
  if (debouncedSearch.trim() !== params.search) {
    const next = new URLSearchParams(sp);
    if (debouncedSearch.trim()) next.set('search', debouncedSearch.trim()); else next.delete('search');
    next.delete('page');
    setSp(next, { replace: true });
  }

  const update = (changes) => {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v == null) next.delete(k); else next.set(k, String(v));
    }
    if (!('page' in changes)) next.delete('page');
    setSp(next);
  };

  const { data, error, isPending, isFetching, isPlaceholderData, refetch } = useDashboard(params);
  const business = useBusiness();
  const actions = useInvoiceActions();

  const list = data?.invoices;
  const hasFilters = Boolean(params.search || params.paymentStatus || params.startDate || params.endDate);
  const clearFilters = () => { setSearchText(''); setSp(new URLSearchParams()); };

  const onSort = (key) => update({
    sortBy: key,
    sortOrder: params.sortBy === key && params.sortOrder === 'desc' ? 'asc' : params.sortBy === key ? 'desc' : 'asc',
  });

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Create, track and send your invoices."
        actions={<Link to="/invoices/new" className={buttonClasses()}><Plus className="size-4" aria-hidden /> New invoice</Link>}
      />
      <Card>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-[1fr_11rem_10rem_10rem_11rem] sm:p-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search invoice number or customer…"
              aria-label="Search invoices"
              className="h-10 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-sm text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <Select aria-label="Filter by status" value={params.paymentStatus} onChange={(e) => update({ status: e.target.value })}>
            <option value="">All statuses</option>
            {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input type="date" aria-label="Created from" title="Created from" value={params.startDate} onChange={(e) => update({ from: e.target.value })} />
          <Input type="date" aria-label="Created to" title="Created to" value={params.endDate} onChange={(e) => update({ to: e.target.value })} />
          <div className="flex gap-2">
            <Select aria-label="Sort by" className="min-w-0 flex-1" value={params.sortBy} onChange={(e) => update({ sortBy: e.target.value })}>
              {INVOICE_SORT_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </Select>
            <Button variant="secondary" size="icon" className="h-10 w-10 shrink-0" onClick={() => update({ sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc', sortBy: params.sortBy })}
              aria-label={`Sort order: ${params.sortOrder === 'asc' ? 'ascending' : 'descending'}. Toggle`} title={params.sortOrder === 'asc' ? 'Ascending' : 'Descending'}>
              {params.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
        {hasFilters && (
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2/50 px-4 py-2 text-sm text-fg-muted sm:px-5">
            <span>Filters active{list ? ` · ${list.pagination.totalInvoices} match${list.pagination.totalInvoices === 1 ? '' : 'es'}` : ''}</span>
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-medium text-brand hover:underline"><X className="size-3.5" aria-hidden /> Clear</button>
          </div>
        )}

        <div className={isFetching && isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'} aria-busy={isFetching}>
          {isPending ? (
            <SkeletonRows rows={8} />
          ) : error && !list ? (
            <ErrorState title="We couldn’t load your invoices" error={error} onRetry={refetch} retrying={isFetching} />
          ) : list.invoices.length === 0 ? (
            hasFilters ? (
              <EmptyState icon={Search} title="No invoices match your filters" description="Try a different search term or clear the filters."
                action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />
            ) : params.page > 1 ? (
              <EmptyState icon={FileText} title="This page is empty" action={<Button variant="secondary" onClick={() => update({ page: 1 })}>Go to first page</Button>} />
            ) : (
              <EmptyState icon={FileText} title="No invoices yet" description="Create your first invoice to get paid faster."
                action={<Link to="/invoices/new" className={buttonClasses()}><Plus className="size-4" aria-hidden /> Create invoice</Link>} />
            )
          ) : (
            <InvoiceTable
              invoices={list.invoices}
              currency={business.data?.currency}
              sortBy={params.sortBy}
              sortOrder={params.sortOrder}
              onSort={onSort}
              menuItems={actions.menuItems}
            />
          )}
        </div>
        {list && (
          <Pagination
            page={list.pagination.currentPage}
            totalPages={list.pagination.totalPages}
            total={list.pagination.totalInvoices}
            limit={list.pagination.limit}
            noun="invoices"
            onPage={(p) => update({ page: p })}
            onLimit={(l) => update({ limit: l })}
          />
        )}
      </Card>
      {actions.dialogs}
    </>
  );
}
