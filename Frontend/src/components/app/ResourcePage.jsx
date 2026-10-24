import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { Sheet, Letterhead } from '../sheet/index.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/FormField.jsx'
import { Menu } from '../ui/Menu.jsx'
import { Ledger } from '../ui/Ledger.jsx'
import { Pagination } from '../ui/Pagination.jsx'
import { LedgerSkeleton } from '../ui/Skeleton.jsx'
import { EmptyState, ErrorState } from '../ui/EmptyState.jsx'
import { ConfirmDialog } from '../ui/Modal.jsx'
import { useToast } from '../ui/Toast.jsx'
import { useDebounce } from '../../hooks/useDebounce.js'
import { storage } from '../../lib/storage.js'
import { normalizeError } from '../../api/errors.js'

/**
 * Shared list page for customers and products: client-side search, sort and pagination,
 * add/edit in a modal, delete with confirmation and an undo window (Command pattern).
 */
export function ResourcePage({ title, noun, nounPlural, description, query, listKey, remove, columns, searchText, nameOf, Modal, crumbs, emptyText }) {
  const qc = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const q = useDebounce(search, 200).trim().toLowerCase()
  const [sort, setSort] = useState({ key: columns.find((c) => c.sortKey)?.sortKey, order: 'asc' })
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(Number(storage.get('ip.pageSize')) || 10)
  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [confirm, setConfirm] = useState(null)

  const rows = useMemo(() => {
    const all = (query.data || []).filter((r) => !q || searchText(r).toLowerCase().includes(q))
    const col = columns.find((c) => c.sortKey === sort.key)
    if (!col) return all
    const get = col.sortValue || ((r) => r[col.sortKey])
    return [...all].sort((a, b) => {
      const x = get(a)
      const y = get(b)
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), undefined, { sensitivity: 'base' })
      return sort.order === 'asc' ? r : -r
    })
  }, [query.data, q, sort, columns, searchText])

  const pages = Math.max(1, Math.ceil(rows.length / limit))
  const current = Math.min(page, pages)
  const visible = rows.slice((current - 1) * limit, current * limit)

  const doDelete = (item) => {
    const snapshot = qc.getQueryData(listKey())
    const restore = () => qc.setQueryData(listKey(), snapshot)
    qc.setQueryData(listKey(), (old = []) => old.filter((x) => x.id !== item.id))
    toast.undoable(`Deleted ${nameOf(item)}`, {
      undo: restore,
      commit: () =>
        remove.mutate(item.id, {
          onError: (e) => {
            restore()
            toast.error(`Could not delete ${noun}`, normalizeError(e).message)
          },
        }),
    })
  }

  const cols = [
    ...columns,
    {
      key: 'actions', header: 'Actions', actions: true,
      render: (r) => (
        <Menu label={`Actions for ${nameOf(r)}`} iconOnly caret={false} icon={MoreHorizontal} variant="ghost" size="sm" items={[
          { label: 'Edit', icon: Pencil, onSelect: () => setEditing(r) },
          { separator: true },
          { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setConfirm(r) },
        ]} />
      ),
    },
  ]

  return (
    <div className="stack-lg">
      <Letterhead title={title} description={description} crumbs={crumbs} actions={<Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>Add {noun}</Button>} />
      <Sheet>
        <div className="toolbar" role="search">
          <Input wrapperClassName="toolbar-grow" label={`Search ${nounPlural}`} type="search" value={search} onChange={(e) => (setSearch(e.target.value), setPage(1))} maxLength={100} autoComplete="off" />
        </div>
        <div aria-live="polite" aria-busy={query.isFetching}>
          {query.isLoading ? <LedgerSkeleton rows={6} label={`Loading ${nounPlural}`} /> : query.isError && !query.data ? (
            <ErrorState message={normalizeError(query.error).message} onRetry={() => query.refetch()} />
          ) : rows.length === 0 ? (
            q ? <EmptyState title={`No ${nounPlural} match`}>Try a different search.</EmptyState> : (
              <EmptyState title={`No ${nounPlural} yet`} action={<Button variant="primary" icon={Plus} onClick={() => setEditing('new')}>Add {noun}</Button>}>{emptyText}</EmptyState>
            )
          ) : (
            <>
              <Ledger caption={title} rows={visible} columns={cols} sort={sort} onSort={(key) => setSort((s) => (s.key === key ? { key, order: s.order === 'asc' ? 'desc' : 'asc' } : { key, order: 'asc' }))} enter />
              <Pagination page={current} pages={pages} total={rows.length} limit={limit} noun={nounPlural} onPage={setPage} onLimit={(n) => (storage.set('ip.pageSize', n), setLimit(n), setPage(1))} />
            </>
          )}
        </div>
      </Sheet>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} {...{ [noun]: editing && editing !== 'new' ? editing : undefined }} />
      <ConfirmDialog open={Boolean(confirm)} onClose={() => setConfirm(null)} title={`Delete ${confirm ? nameOf(confirm) : ''}?`} confirmLabel={`Delete ${noun}`} onConfirm={() => { doDelete(confirm); setConfirm(null) }}>
        <p>This removes the {noun} from your list. Existing invoices keep their own copy of the details. You can undo for a few seconds.</p>
      </ConfirmDialog>
    </div>
  )
}
