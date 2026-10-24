import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Copy, Download, Eye, FileX2, MoreHorizontal, Mail, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Sheet, Letterhead } from '../../components/sheet/index.jsx'
import { LinkButton } from '../../components/ui/Button.jsx'
import { Input, Select } from '../../components/ui/FormField.jsx'
import { Menu } from '../../components/ui/Menu.jsx'
import { StatusBadge } from '../../components/ui/Badge.jsx'
import { Ledger } from '../../components/ui/Ledger.jsx'
import { Pagination } from '../../components/ui/Pagination.jsx'
import { LedgerSkeleton } from '../../components/ui/Skeleton.jsx'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState.jsx'
import { ConfirmDialog } from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useBusiness, useDashboard, useDuplicateInvoice } from '../../hooks/queries.js'
import { useEmailInvoice, usePdfDownload, useUndoableDelete } from '../../hooks/useInvoiceActions.js'
import { useDebounce } from '../../hooks/useDebounce.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { INVOICE_STATUSES, PAGE_SIZES, SORT_FIELDS } from '../../config/enums.js'
import { clampInt } from '../../lib/security.js'
import { formatDate, formatMoney, isPastDue } from '../../lib/format.js'
import { storage } from '../../lib/storage.js'
import { normalizeError } from '../../api/errors.js'

/** All list state lives in the URL, so views can be bookmarked and the back button works. */
function readState(sp) {
  const stored = Number(storage.get('ip.pageSize')) || 10
  const limit = PAGE_SIZES.includes(Number(sp.get('limit'))) ? Number(sp.get('limit')) : stored
  const status = INVOICE_STATUSES.includes(sp.get('status')) ? sp.get('status') : ''
  const sort = SORT_FIELDS.includes(sp.get('sort')) ? sp.get('sort') : 'createdAt'
  return {
    page: clampInt(sp.get('page'), 1, 100000, 1),
    limit,
    q: (sp.get('q') || '').slice(0, 100),
    status,
    from: /^\d{4}-\d{2}-\d{2}$/.test(sp.get('from') || '') ? sp.get('from') : '',
    to: /^\d{4}-\d{2}-\d{2}$/.test(sp.get('to') || '') ? sp.get('to') : '',
    sort,
    order: sp.get('order') === 'asc' ? 'asc' : 'desc',
  }
}

export default function InvoiceList() {
  useDocumentTitle('Invoices')
  const [sp, setSp] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const state = useMemo(() => readState(sp), [sp])
  const [search, setSearch] = useState(state.q)
  const debounced = useDebounce(search, 300)
  const [confirm, setConfirm] = useState(null)
  const business = useBusiness()
  const query = useDashboard(state)
  const duplicate = useDuplicateInvoice()
  const email = useEmailInvoice()
  const pdf = usePdfDownload()
  const remove = useUndoableDelete()
  const currency = business.data?.currency || 'INR'

  const patch = (changes, { resetPage = true } = {}) => {
    const next = new URLSearchParams(sp)
    Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, String(v))))
    if (resetPage) next.delete('page')
    setSp(next, { replace: true })
  }

  useEffect(() => {
    if (debounced !== state.q) patch({ q: debounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  useEffect(() => {
    if (pdf.state.phase === 'success') toast.success('PDF downloaded')
    else if (pdf.state.phase === 'timeout' || pdf.state.phase === 'error') toast.error('PDF not ready', pdf.state.message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf.state.phase])

  const onSort = (key) => patch(state.sort === key ? { order: state.order === 'asc' ? 'desc' : 'asc' } : { sort: key, order: 'asc' })
  const filtered = Boolean(state.q || state.status || state.from || state.to)

  const doDuplicate = (inv) =>
    duplicate.mutate(inv.id, {
      onSuccess: (copy) => {
        toast.success('Duplicated as a Draft')
        navigate(`/invoices/${copy.id}`)
      },
      onError: (e) => toast.error('Could not duplicate', normalizeError(e).message),
    })

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice', sortKey: 'invoiceNumber', primary: true, render: (i) => <Link to={`/invoices/${i.id}`} className="cell-primary">{i.invoiceNumber}</Link> },
    { key: 'customer', header: 'Customer', hideSm: true, render: (i) => <span className="cell-trunc" style={{ display: 'block' }}>{i.customer.customerName}</span> },
    { key: 'invoiceDate', header: 'Created', sortKey: 'createdAt', hideSm: true, render: (i) => formatDate(i.invoiceDate) },
    { key: 'dueDate', header: 'Due', sortKey: 'dueDate', render: (i) => <>{formatDate(i.dueDate)}{isPastDue(i) && <span className="badge" data-tone="warning" title="Status is still Pending" style={{ marginInlineStart: 6 }}>Past due</span>}</> },
    { key: 'status', header: 'Status', sortKey: 'status', render: (i) => <StatusBadge status={i.status} /> },
    { key: 'grandTotal', header: 'Total', sortKey: 'grandTotal', num: true, render: (i) => formatMoney(i.grandTotal, currency) },
    {
      key: 'actions', header: 'Actions', actions: true,
      render: (i) => (
        <Menu label={`Actions for ${i.invoiceNumber}`} iconOnly caret={false} icon={MoreHorizontal} variant="ghost" size="sm" items={[
          { label: 'View', icon: Eye, onSelect: () => navigate(`/invoices/${i.id}`) },
          { label: 'Edit', icon: Pencil, onSelect: () => navigate(`/invoices/${i.id}/edit`) },
          { label: 'Duplicate', icon: Copy, onSelect: () => doDuplicate(i) },
          { label: 'Email to customer', icon: Mail, onSelect: () => email(i) },
          { label: pdf.busy ? 'Preparing PDF…' : 'Download PDF', icon: Download, disabled: pdf.busy, onSelect: () => (toast.info('Preparing PDF…'), pdf.start(i)) },
          { separator: true },
          { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setConfirm(i) },
        ]} />
      ),
    },
  ]

  const d = query.data
  return (
    <div className="stack-lg">
      <Letterhead title="Invoices" description="Search, filter and manage every invoice." crumbs={[{ to: '/dashboard', label: 'Dashboard' }, { label: 'Invoices' }]} actions={<LinkButton to="/invoices/new" variant="primary" icon={Plus}>New invoice</LinkButton>} />
      <Sheet>
        <form className="toolbar" role="search" aria-label="Filter invoices" onSubmit={(e) => e.preventDefault()}>
          <Input wrapperClassName="toolbar-grow" label="Search" type="search" placeholder="Invoice number or customer" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={100} autoComplete="off" />
          <Select label="Status" value={state.status} onChange={(e) => patch({ status: e.target.value })}>
            <option value="">All statuses</option>
            {INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Input label="Created from" type="date" value={state.from} max={state.to || undefined} onChange={(e) => patch({ from: e.target.value })} />
          <Input label="Created to" type="date" value={state.to} min={state.from || undefined} onChange={(e) => patch({ to: e.target.value })} />
        </form>

        <div aria-live="polite" aria-busy={query.isFetching}>
          {query.isLoading ? <LedgerSkeleton rows={8} label="Loading invoices" /> : query.isError && !d ? (
            <ErrorState message={normalizeError(query.error).message} onRetry={() => query.refetch()} />
          ) : d.invoices.length === 0 ? (
            filtered ? (
              <EmptyState title="No invoices match" action={<button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSp(new URLSearchParams(), { replace: true }) }}><span className="btn-label">Clear filters</span></button>}>Try a different search or widen the dates.</EmptyState>
            ) : (
              <EmptyState title="No invoices yet" action={<LinkButton to="/invoices/new" variant="primary" icon={Plus}>Create your first invoice</LinkButton>}>Each invoice you create appears here.</EmptyState>
            )
          ) : (
            <>
              <Ledger caption="Invoices" rows={d.invoices} columns={columns} sort={{ key: state.sort, order: state.order }} onSort={onSort} onRowClick={(i) => navigate(`/invoices/${i.id}`)} enter />
              <Pagination page={state.page} pages={d.pagination.pages} total={d.pagination.total} limit={state.limit} noun="invoices" onPage={(p) => patch({ page: p }, { resetPage: false })} onLimit={(n) => { storage.set('ip.pageSize', n); patch({ limit: n }) }} />
            </>
          )}
        </div>
      </Sheet>

      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} title={`Delete ${confirm?.invoiceNumber}?`} confirmLabel="Delete invoice" onConfirm={() => { remove(confirm); setConfirm(null) }}>
        <p>This removes the invoice for {confirm?.customer.customerName}. You can undo for a few seconds afterwards.</p>
      </ConfirmDialog>
    </div>
  )
}
