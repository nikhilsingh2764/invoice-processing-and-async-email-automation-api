import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CheckCircle2, Copy, Download, Mail, MoreHorizontal, Pencil, Printer, Trash2 } from 'lucide-react'
import { Sheet, Letterhead, MetaStrip, MetaCell, Party, Totals, Stamp, Perforation } from '../../components/sheet/index.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button, LinkButton } from '../../components/ui/Button.jsx'
import { Menu } from '../../components/ui/Menu.jsx'
import { Ledger } from '../../components/ui/Ledger.jsx'
import { ConfirmDialog } from '../../components/ui/Modal.jsx'
import { CardSkeleton } from '../../components/ui/Skeleton.jsx'
import { ErrorState } from '../../components/ui/EmptyState.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useBusiness, useDeleteInvoice, useDuplicateInvoice, useInvoice, useSetInvoiceStatus } from '../../hooks/queries.js'
import { useEmailInvoice, usePdfDownload } from '../../hooks/useInvoiceActions.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { formatDate, formatMoney, isPastDue } from '../../lib/format.js'
import { INVOICE_STATUSES } from '../../config/enums.js'
import { normalizeError } from '../../api/errors.js'
import { safeUrl } from '../../lib/security.js'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const q = useInvoice(id)
  const business = useBusiness()
  const setStatus = useSetInvoiceStatus()
  const duplicate = useDuplicateInvoice()
  const del = useDeleteInvoice()
  const email = useEmailInvoice()
  const pdf = usePdfDownload()
  const [confirm, setConfirm] = useState(false)
  const inv = q.data
  useDocumentTitle(inv ? `Invoice ${inv.invoiceNumber}` : 'Invoice')

  useEffect(() => {
    if (pdf.state.phase === 'success') toast.success('PDF downloaded')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf.state.phase])

  if (q.isLoading) return <div className="stack-lg"><Letterhead title="Invoice" /><CardSkeleton height={380} /></div>
  if (q.isError) {
    const n = normalizeError(q.error)
    return <ErrorState title={n.status === 404 ? 'Invoice not found' : undefined} message={n.status === 404 ? 'It may have been deleted.' : n.message} onRetry={n.status === 404 ? undefined : () => q.refetch()} />
  }

  const currency = inv.business.currency || business.data?.currency || 'INR'
  const changeStatus = (status) =>
    setStatus.mutate({ id, status }, { onSuccess: () => toast.success(`Marked as ${status}`), onError: (e) => toast.error('Could not change status', normalizeError(e).message) })
  const logo = safeUrl(inv.business.logo)
  const pastDue = isPastDue(inv)

  return (
    <div className="stack-lg">
      <Letterhead
        title={inv.invoiceNumber}
        crumbs={[{ to: '/invoices', label: 'Invoices' }, { label: inv.invoiceNumber }]}
        actions={
          <>
            <Button variant="primary" icon={Download} loading={pdf.busy} onClick={() => pdf.start(inv)}>{pdf.label}</Button>
            <Button icon={Mail} onClick={() => email(inv)}>Email to customer</Button>
            {inv.status !== 'Paid' && inv.status !== 'Cancelled' && <Button icon={CheckCircle2} loading={setStatus.isPending} onClick={() => changeStatus('Paid')}>Mark as paid</Button>}
            <Menu label="More actions" iconOnly caret={false} icon={MoreHorizontal} items={[
              { label: 'Edit', icon: Pencil, onSelect: () => navigate(`/invoices/${id}/edit`) },
              { label: 'Duplicate', icon: Copy, onSelect: () => duplicate.mutate(id, { onSuccess: (c) => (toast.success('Duplicated as a Draft'), navigate(`/invoices/${c.id}`)), onError: (e) => toast.error('Could not duplicate', normalizeError(e).message) }) },
              { label: 'Print', icon: Printer, onSelect: () => window.print() },
              { heading: 'Set status' },
              ...INVOICE_STATUSES.map((s) => ({ label: s, checked: inv.status === s, onSelect: () => changeStatus(s) })),
              { separator: true },
              { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setConfirm(true) },
            ]} />
          </>
        }
      />
      <div aria-live="polite">
        {pdf.state.phase === 'timeout' && <Alert tone="warning" title="The PDF is taking longer than expected" actions={<Button size="sm" onClick={() => pdf.start(inv)}>Retry</Button>}>{pdf.state.message}</Alert>}
        {pdf.state.phase === 'error' && <Alert tone="danger" title="Could not prepare the PDF" actions={<Button size="sm" onClick={() => pdf.start(inv)}>Retry</Button>}>{pdf.state.message}</Alert>}
      </div>

      <Sheet a4 fold as="article" aria-label={`Invoice ${inv.invoiceNumber}`} className="invoice-paper">
        <div className="stack-lg">
          <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
            <div>
              {logo && <img src={logo} alt={`${inv.business.businessName} logo`} referrerPolicy="no-referrer" style={{ maxBlockSize: 56, maxInlineSize: 160, marginBlockEnd: 8 }} />}
              <h2 style={{ fontSize: 'var(--text-xl)' }}>{inv.business.businessName}</h2>
              <p className="muted">{inv.business.ownerName}</p>
            </div>
            <Stamp status={inv.status} animate />
          </header>
          <MetaStrip label="Invoice details">
            <MetaCell label="Invoice no." value={inv.invoiceNumber} />
            <MetaCell label="Issued" value={formatDate(inv.invoiceDate)} />
            <MetaCell label="Due" value={formatDate(inv.dueDate)} hint={pastDue ? 'Past due (status still Pending)' : undefined} />
            <MetaCell label="Total" value={formatMoney(inv.grandTotal, currency)} />
          </MetaStrip>
          <div className="parties">
            <Party title="From" name={inv.business.businessName} lines={[inv.business.email, inv.business.phone, inv.business.gstNumber && `GST ${inv.business.gstNumber}`]} address={inv.business.address} />
            <Party title="Bill to" name={inv.customer.customerName} lines={[inv.customer.companyName, inv.customer.email, inv.customer.phone, inv.customer.gstNumber && `GST ${inv.customer.gstNumber}`]} address={inv.customer.billingAddress} />
          </div>
          <Ledger caption="Invoice items" rows={inv.items} rowKey={(r, i) => `${r.productId}-${i}`} gutter columns={[
            { key: 'productName', header: 'Item', primary: true, render: (r) => <><span className="cell-primary">{r.productName}</span>{r.description && <span className="cell-secondary">{r.description}</span>}</> },
            { key: 'quantity', header: 'Qty', num: true, render: (r) => `${r.quantity}${r.unit ? ` ${r.unit}` : ''}` },
            { key: 'price', header: 'Price', num: true, hideSm: true, render: (r) => formatMoney(r.price, currency) },
            { key: 'taxRate', header: 'Tax', num: true, hideSm: true, render: (r) => `${r.taxRate}%` },
            { key: 'lineTotal', header: 'Amount', num: true, render: (r) => formatMoney(r.lineTotal, currency) },
          ]} />
          <Totals currency={currency} subTotal={inv.subTotal} totalDiscount={inv.totalDiscount} totalTax={inv.totalTax} grandTotal={inv.grandTotal} />
          <Perforation />
          <div className="footer-notes">
            {inv.paymentMethod && <p><span className="notes-title">Payment method: </span>{inv.paymentMethod}</p>}
            {inv.notes && <div><p className="notes-title">Notes</p><p style={{ whiteSpace: 'pre-wrap' }}>{inv.notes}</p></div>}
            {inv.termsAndConditions && <div><p className="notes-title">Terms and conditions</p><p style={{ whiteSpace: 'pre-wrap' }}>{inv.termsAndConditions}</p></div>}
          </div>
        </div>
      </Sheet>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} loading={del.isPending} title={`Delete ${inv.invoiceNumber}?`} confirmLabel="Delete invoice"
        onConfirm={() => del.mutate(id, { onSuccess: () => (toast.success('Invoice deleted'), navigate('/invoices', { replace: true })), onError: (e) => (setConfirm(false), toast.error('Could not delete', normalizeError(e).message)) })}>
        <p>This permanently removes the invoice for {inv.customer.customerName}. This cannot be undone.</p>
      </ConfirmDialog>
    </div>
  )
}
