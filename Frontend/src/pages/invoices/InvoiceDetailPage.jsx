import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Mail, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { buttonClasses } from '../../components/common/button-styles';
import Dropdown from '../../components/common/Dropdown';
import StatusBadge from '../../components/common/StatusBadge';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/feedback/ErrorState';
import Skeleton from '../../components/feedback/Skeleton';
import { useInvoiceActions } from '../../components/invoice/useInvoiceActions';
import { useInvoice } from '../../hooks/queries';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatAddress, formatDate, formatMoney, isPastDue } from '../../lib/format';

function Party({ title, name, lines }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">{title}</h3>
      <p className="mt-1.5 break-words font-semibold text-fg">{name}</p>
      <div className="mt-1 space-y-0.5 break-words text-sm text-fg-muted">
        {lines.filter(Boolean).map((l) => <p key={l}>{l}</p>)}
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: inv, error, isPending, refetch, isFetching } = useInvoice(id);
  const actions = useInvoiceActions({ onDeleted: () => navigate('/invoices', { replace: true }) });
  useDocumentTitle(inv?.invoiceNumber ?? 'Invoice');

  const back = (
    <Link to="/invoices" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
      <ArrowLeft className="size-4" aria-hidden /> Invoices
    </Link>
  );

  if (isPending) {
    return (
      <>
        {back}
        <Card className="space-y-4 p-6"><Skeleton className="h-8 w-56" /><Skeleton className="h-24" /><Skeleton className="h-48" /></Card>
      </>
    );
  }
  if (error) {
    return <>{back}<Card><ErrorState title="We couldn’t load this invoice" error={error} onRetry={refetch} retrying={isFetching} /></Card></>;
  }

  const cur = inv.business?.currency;
  const downloading = actions.isDownloadingPdf(inv._id);

  return (
    <>
      {back}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all text-2xl font-semibold tracking-tight text-fg">{inv.invoiceNumber}</h1>
            <StatusBadge status={inv.status} />
            {isPastDue(inv) && <Badge tone="danger">Past due</Badge>}
          </div>
          <p className="mt-1 text-sm text-fg-muted">Issued {formatDate(inv.invoiceDate ?? inv.createdAt)} · Due {formatDate(inv.dueDate, { utc: true })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => actions.downloadPdf(inv)} loading={downloading}>
            {!downloading && <Download className="size-4" aria-hidden />} {downloading ? 'Preparing PDF…' : 'PDF'}
          </Button>
          <Button variant="secondary" onClick={() => actions.requestEmail(inv)}><Mail className="size-4" aria-hidden /> Email</Button>
          <Link to={`/invoices/${inv._id}/edit`} className={buttonClasses()}><Pencil className="size-4" aria-hidden /> Edit</Link>
          <Dropdown
            items={[
              { label: 'Duplicate', icon: Copy, onClick: () => actions.duplicate(inv), disabled: actions.isDuplicating },
              { divider: true },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => actions.requestDelete(inv) },
            ]}
            trigger={(props) => (
              <Button variant="secondary" size="icon" className="h-10 w-10" aria-label="More actions" {...props}><MoreHorizontal className="size-[18px]" /></Button>
            )}
          />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="grid gap-6 sm:grid-cols-2">
              <Party title="From" name={inv.business?.businessName}
                lines={[inv.business?.ownerName, inv.business?.email, inv.business?.phone, inv.business?.gstNumber && `GSTIN ${inv.business.gstNumber}`, formatAddress(inv.business?.address)]} />
              <Party title="Bill to" name={inv.customer?.customerName}
                lines={[inv.customer?.companyName, inv.customer?.email, inv.customer?.phone, inv.customer?.gstNumber && `GSTIN ${inv.customer.gstNumber}`, formatAddress(inv.customer?.billingAddress)]} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Items" />
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-fg-muted">
                    <th scope="col" className="py-3 pl-5 pr-4 font-medium">Item</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Price</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Qty</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Disc.</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Tax</th>
                    <th scope="col" className="py-3 pl-4 pr-5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {inv.items.map((it, i) => (
                    <tr key={`${it.productId}-${i}`}>
                      <td className="max-w-64 py-3 pl-5 pr-4">
                        <p className="break-words font-medium text-fg">{it.productName}</p>
                        {it.description && <p className="line-clamp-2 break-words text-xs text-fg-muted">{it.description}</p>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatMoney(it.price, cur)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{it.quantity} {it.unit}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{it.discount}%</td>
                      <td className="px-4 py-3 text-right tabular-nums">{it.taxRate}%</td>
                      <td className="whitespace-nowrap py-3 pl-4 pr-5 text-right font-medium tabular-nums">{formatMoney(it.lineTotal, cur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {inv.items.map((it, i) => (
                <li key={`${it.productId}-${i}`} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 break-words font-medium text-fg">{it.productName}</p>
                    <p className="shrink-0 font-semibold tabular-nums">{formatMoney(it.lineTotal, cur)}</p>
                  </div>
                  <p className="mt-1 text-xs text-fg-muted">{it.quantity} {it.unit} × {formatMoney(it.price, cur)} · {it.discount}% off · {it.taxRate}% tax</p>
                </li>
              ))}
            </ul>
          </Card>

          {(inv.notes || inv.termsAndConditions) && (
            <Card>
              <CardBody className="space-y-4 text-sm">
                {inv.notes && <div><h3 className="font-semibold text-fg">Notes</h3><p className="mt-1 whitespace-pre-wrap break-words text-fg-muted">{inv.notes}</p></div>}
                {inv.termsAndConditions && <div><h3 className="font-semibold text-fg">Terms &amp; conditions</h3><p className="mt-1 whitespace-pre-wrap break-words text-fg-muted">{inv.termsAndConditions}</p></div>}
              </CardBody>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="Summary" />
          <CardBody>
            <dl className="space-y-2.5 text-sm">
              {[['Subtotal', inv.subTotal], ['Discount', -inv.totalDiscount], ['Tax', inv.totalTax]].map(([label, v]) => (
                <div key={label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-fg-muted">{label}</dt>
                  <dd className="font-medium tabular-nums">{v < 0 ? '− ' : ''}{formatMoney(Math.abs(v), cur)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="break-all text-right text-xl font-semibold tabular-nums">{formatMoney(inv.grandTotal, cur)}</dd>
              </div>
            </dl>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-fg-muted">Payment method</dt><dd className="text-right text-fg">{inv.paymentMethod ?? '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-fg-muted">Currency</dt><dd className="text-fg">{cur ?? '—'}</dd></div>
            </dl>
          </CardBody>
        </Card>
      </div>
      {actions.dialogs}
    </>
  );
}
