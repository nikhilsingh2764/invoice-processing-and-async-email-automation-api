import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreHorizontal } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Badge from '../common/Badge';
import Dropdown from '../common/Dropdown';
import { cn } from '../../lib/cn';
import { formatDate, formatMoney, isPastDue } from '../../lib/format';

const COLUMNS = [
  { key: 'invoiceNumber', label: 'Invoice', sortKey: 'invoiceNumber' },
  { key: 'customer', label: 'Customer' },
  { key: 'date', label: 'Date', sortKey: 'invoiceDate', hideOnCompact: true },
  { key: 'dueDate', label: 'Due', sortKey: 'dueDate' },
  { key: 'amount', label: 'Amount', sortKey: 'grandTotal', align: 'right' },
  { key: 'status', label: 'Status', sortKey: 'status' },
];

const moneyOf = (inv, fallback) => formatMoney(inv.grandTotal ?? inv.totalAmount, inv.business?.currency ?? fallback);

function RowMenu({ invoice, menuItems }) {
  if (!menuItems) return null;
  return (
    <Dropdown
      items={menuItems(invoice)}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={`Actions for invoice ${invoice.invoiceNumber}`}
          className="grid size-8 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
        >
          <MoreHorizontal className="size-[18px]" />
        </button>
      )}
    />
  );
}

function StatusCell({ invoice }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <StatusBadge status={invoice.status ?? invoice.paymentStatus} />
      {isPastDue(invoice) && <Badge tone="danger">Past due</Badge>}
    </span>
  );
}

/**
 * Responsive list: a real table from `md` up, stacked cards on small screens.
 * `onSort`/`sortBy`/`sortOrder` make headers sortable; `menuItems(invoice)` adds the row action menu.
 */
export default function InvoiceTable({ invoices, currency, sortBy, sortOrder, onSort, menuItems, compact = false }) {
  const columns = COLUMNS.filter((c) => !(compact && c.hideOnCompact));

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-fg-muted">
              {columns.map((c) => {
                const active = onSort && c.sortKey && sortBy === c.sortKey;
                const Icon = !active ? ChevronsUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn('px-4 py-3 font-medium first:pl-5', c.align === 'right' && 'text-right')}
                  >
                    {onSort && c.sortKey ? (
                      <button
                        type="button"
                        onClick={() => onSort(c.sortKey)}
                        className={cn('inline-flex items-center gap-1 uppercase tracking-wide hover:text-fg', active && 'text-fg')}
                      >
                        {c.label}
                        <Icon className={cn('size-3.5', !active && 'opacity-50')} aria-hidden />
                      </button>
                    ) : c.label}
                  </th>
                );
              })}
              {menuItems && <th scope="col" className="w-12 px-3 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invoices.map((inv) => (
              <tr key={inv._id} className="transition-colors hover:bg-surface-2/60">
                <td className="whitespace-nowrap py-3 pl-5 pr-4">
                  <Link to={`/invoices/${inv._id}`} className="font-medium text-brand hover:underline">{inv.invoiceNumber}</Link>
                </td>
                <td className="max-w-56 px-4 py-3">
                  <p className="truncate font-medium text-fg" title={inv.customer?.customerName}>{inv.customer?.customerName ?? '—'}</p>
                  <p className="truncate text-xs text-fg-muted" title={inv.customer?.email}>{inv.customer?.email}</p>
                </td>
                {!compact && <td className="whitespace-nowrap px-4 py-3 text-fg-muted">{formatDate(inv.invoiceDate ?? inv.createdAt)}</td>}
                <td className="whitespace-nowrap px-4 py-3 text-fg-muted">{formatDate(inv.dueDate, { utc: true })}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-fg">{moneyOf(inv, currency)}</td>
                <td className="px-4 py-3"><StatusCell invoice={inv} /></td>
                {menuItems && <td className="px-3 py-3 text-right"><RowMenu invoice={inv} menuItems={menuItems} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {invoices.map((inv) => (
          <li key={inv._id} className="flex items-start gap-2 p-4">
            <Link to={`/invoices/${inv._id}`} className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-semibold text-brand">{inv.invoiceNumber}</span>
                <span className="shrink-0 font-semibold tabular-nums text-fg">{moneyOf(inv, currency)}</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-fg" title={inv.customer?.customerName}>{inv.customer?.customerName ?? '—'}</p>
              <p className="truncate text-xs text-fg-muted">{inv.customer?.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <StatusCell invoice={inv} />
                <span className="text-xs text-fg-muted">Due {formatDate(inv.dueDate, { utc: true })}</span>
              </div>
            </Link>
            <RowMenu invoice={inv} menuItems={menuItems} />
          </li>
        ))}
      </ul>
    </>
  );
}
