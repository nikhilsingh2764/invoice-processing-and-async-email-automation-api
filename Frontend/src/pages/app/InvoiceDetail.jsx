import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CheckCircle2, Copy, Download, Mail, MoreHorizontal, Pencil, Printer, Trash2 } from 'lucide-react'
import { Letterhead } from '../../components/sheet/index.jsx'
import { InvoiceDoc } from '../../components/invoice/InvoiceDoc.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button, LinkButton } from '../../components/ui/Button.jsx'
import { Menu } from '../../components/ui/Menu.jsx'
import { ConfirmDialog } from '../../components/ui/Modal.jsx'
import { CardSkeleton } from '../../components/ui/Skeleton.jsx'
import { ErrorState } from '../../components/ui/EmptyState.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useBusiness, useDeleteInvoice, useDuplicateInvoice, useInvoice, useSetInvoiceStatus } from '../../hooks/queries.js'
import { useEmailInvoice, usePdfDownload } from '../../hooks/useInvoiceActions.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { isPastDue } from '../../lib/format.js'
import { INVOICE_STATUSES } from '../../config/enums.js'
import { normalizeError } from '../../api/errors.js'

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
  const pastDue = isPastDue(inv)

  return (
    <div className="stack-lg inv-page">
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

      <InvoiceDoc inv={inv} currency={currency} pastDue={pastDue} />

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} loading={del.isPending} title={`Delete ${inv.invoiceNumber}?`} confirmLabel="Delete invoice"
        onConfirm={() => del.mutate(id, { onSuccess: () => (toast.success('Invoice deleted'), navigate('/invoices', { replace: true })), onError: (e) => (setConfirm(false), toast.error('Could not delete', normalizeError(e).message)) })}>
        <p>This permanently removes the invoice for {inv.customer.customerName}. This cannot be undone.</p>
      </ConfirmDialog>
    </div>
  )
}
