import { useEffect, useMemo, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Minus, Plus, Trash2, UserPlus, PackagePlus } from 'lucide-react'
import { Sheet, Letterhead, FormZone, Totals } from '../../components/sheet/index.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select, Textarea } from '../../components/ui/FormField.jsx'
import { ConfirmDialog } from '../../components/ui/Modal.jsx'
import { CardSkeleton } from '../../components/ui/Skeleton.jsx'
import { ErrorState } from '../../components/ui/EmptyState.jsx'
import { CustomerModal } from '../../components/forms/CustomerModal.jsx'
import { ProductModal } from '../../components/forms/ProductModal.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useBusiness, useCreateInvoice, useCustomers, useInvoice, useProducts, useUpdateInvoice } from '../../hooks/queries.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import { invoiceSchema } from '../../lib/validators.js'
import { computeTotals, nextInvoiceNumber } from '../../lib/money.js'
import { addDays, formatMoney, toDateInput } from '../../lib/format.js'
import { applyServerErrors } from '../../lib/forms.js'
import { normalizeError } from '../../api/errors.js'
import { INVOICE_STATUSES, PAYMENT_METHODS } from '../../config/enums.js'
import { Link } from 'react-router'

const emptyItem = { productId: '', quantity: 1 }

function Stepper({ value, onChange, label, error }) {
  const n = Number(value) || 0
  const round = (x) => Math.round(x * 100) / 100
  return (
    <div className="field">
      <span className="label">Quantity</span>
      <div className="stepper">
        <Button size="sm" iconOnly icon={Minus} disabled={n <= 1} onClick={() => onChange(round(Math.max(1, n - 1)))}>Decrease quantity</Button>
        <input className="input stepper-input" inputMode="decimal" aria-label={label} aria-invalid={error ? 'true' : undefined} value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'))} />
        <Button size="sm" iconOnly icon={Plus} onClick={() => onChange(round(n + 1))}>Increase quantity</Button>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  )
}

export default function InvoiceForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  useDocumentTitle(editing ? 'Edit invoice' : 'New invoice')
  const navigate = useNavigate()
  const toast = useToast()
  const business = useBusiness()
  const customers = useCustomers()
  const products = useProducts()
  const invoice = useInvoice(id)
  const create = useCreateInvoice()
  const update = useUpdateInvoice(id)
  const [formError, setFormError] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [saved, setSaved] = useState(false)

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { customerId: '', items: [emptyItem], dueDate: toDateInput(addDays(new Date(), 30)), status: 'Pending', paymentMethod: '', notes: '', termsAndConditions: '' },
  })
  const { register, control, handleSubmit, reset, watch, setValue, setError, setFocus, formState: { errors, isDirty, isSubmitting } } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const customerId = watch('customerId')

    const original = useMemo(() => {
    if (!editing || !invoice.data || !customers.data) return null
    // Newer invoices store customerId; older ones only hold a snapshot, so fall back to matching by email.
    const byId = invoice.data.customerId && customers.data.find((c) => c.id === invoice.data.customerId)
    const match = byId || customers.data.find((c) => c.email.toLowerCase() === invoice.data.customer.email.toLowerCase())
    return { ...invoice.data, customerId: match?.id || '' }
  }, [editing, invoice.data, customers.data])

  useEffect(() => {
    if (!original) return
    reset({
      customerId: original.customerId,
      items: original.items.length ? original.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) : [emptyItem],
      dueDate: toDateInput(original.dueDate),
      status: original.status,
      paymentMethod: original.paymentMethod || '',
      notes: original.notes || '',
      termsAndConditions: original.termsAndConditions || '',
    })
  }, [original, reset])

  const currency = business.data?.currency || 'INR'
  const priced = items.map((i) => {
    const p = products.data?.find((x) => x.id === i.productId)
    return p ? { ...p, quantity: Number(i.quantity) || 0 } : { price: 0, taxRate: 0, discount: 0, quantity: 0 }
  })
  const totals = computeTotals(priced)

  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && !saved && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (!isDirty || saved) return undefined
    const h = (e) => e.preventDefault()
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [isDirty, saved])

  const filteredCustomers = (customers.data || []).filter((c) => `${c.customerName} ${c.email} ${c.companyName}`.toLowerCase().includes(customerFilter.trim().toLowerCase()))

  const submit = handleSubmit(
    async (values) => {
      if (isSubmitting || create.isPending || update.isPending) return
      setFormError('')
      try {
        const result = editing ? await update.mutateAsync({ values, original }) : await create.mutateAsync(values)
        setSaved(true)
        toast.success(editing ? 'Invoice updated' : `Invoice ${result.invoiceNumber} created`)
        setTimeout(() => navigate(`/invoices/${result.id}`), 0)
      } catch (e) {
        if (!applyServerErrors(setError, e, { dueDate: 'dueDate' })) setFormError(normalizeError(e).message)
      }
    },
    (errs) => {
      const first = Object.keys(errs)[0]
      if (first === 'items') setFocus('items.0.productId')
      else setFocus(first)
    },
  )

  if (business.isLoading || customers.isLoading || products.isLoading || (editing && invoice.isLoading)) return <div className="stack-lg"><Letterhead title={editing ? 'Edit invoice' : 'New invoice'} /><CardSkeleton height={320} /></div>
  if (editing && invoice.isError) return <ErrorState message={normalizeError(invoice.error).message} onRetry={() => invoice.refetch()} />
  if (!business.data) return <Alert tone="warning" title="Add your business first">Invoices carry your business details. <Link to="/business">Set up your business</Link>, then come back.</Alert>

  const noCustomers = (customers.data?.length || 0) === 0
  const noProducts = (products.data?.length || 0) === 0
  const previewNumber = editing ? invoice.data?.invoiceNumber : nextInvoiceNumber(business.data.invoicePrefix, business.data.invoiceStartNumber, 0)

  return (
    <form onSubmit={submit} noValidate className="stack-lg">
      <Letterhead
        title={editing ? `Edit ${invoice.data?.invoiceNumber}` : 'New invoice'}
        description={editing ? 'Changing items recalculates the totals on the server.' : `The number is assigned by the server, usually ${previewNumber}.`}
        crumbs={[{ to: '/invoices', label: 'Invoices' }, { label: editing ? 'Edit' : 'New' }]}
      />
      {formError && <Alert tone="danger" title="Could not save the invoice">{formError}</Alert>}
      {editing && original && !original.customerId && <Alert tone="warning">The original customer is no longer in your list. Choose a customer to continue.</Alert>}

      <Sheet>
        <FormZone n="1" title="Customer" id="z-customer">
          {noCustomers ? (
            <Alert tone="info" title="Add a customer first" actions={<Button icon={UserPlus} onClick={() => setModal('customer')}>Add customer</Button>}>An invoice needs someone to bill.</Alert>
          ) : (
            <div className="form-grid">
              {customers.data.length > 8 && <Input wrapperClassName="span-2" label="Find a customer" type="search" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} autoComplete="off" />}
              <Select wrapperClassName="span-2" label="Customer" error={errors.customerId?.message} {...register('customerId')}>
                <option value="">Choose a customer</option>
                {filteredCustomers.map((c) => <option key={c.id} value={c.id}>{c.customerName} · {c.email}</option>)}
              </Select>
              <div><Button icon={UserPlus} size="sm" variant="ghost" onClick={() => setModal('customer')}>New customer</Button></div>
            </div>
          )}
        </FormZone>

        <FormZone n="2" title="Items" id="z-items" description="Totals use the same rounding as the server. The server calculates the final amounts.">
          {noProducts ? (
            <Alert tone="info" title="Add a product first" actions={<Button icon={PackagePlus} onClick={() => setModal('product')}>Add product</Button>}>Pick products from your catalogue.</Alert>
          ) : (
            <div className="stack">
              {typeof errors.items?.message === 'string' && <p className="field-error" role="alert">{errors.items.message}</p>}
              {fields.map((f, idx) => {
                const line = totals.lines[idx]
                return (
                  <div key={f.id} className="card item-row">
                    <Select label={`Product ${idx + 1}`} error={errors.items?.[idx]?.productId?.message} {...register(`items.${idx}.productId`)}>
                      <option value="">Choose a product</option>
                      {products.data.map((p) => <option key={p.id} value={p.id} disabled={items.some((it, k) => k !== idx && it.productId === p.id)}>{p.productName} · {formatMoney(p.price, currency)}</option>)}
                    </Select>
                    <Controller control={control} name={`items.${idx}.quantity`} render={({ field }) => <Stepper label={`Quantity for item ${idx + 1}`} value={field.value} onChange={field.onChange} error={errors.items?.[idx]?.quantity?.message} />} />
                    <div className="tabular item-total" aria-live="polite">
                      <span className="muted" style={{ fontSize: 'var(--text-xs)' }}>Line total</span>
                      <div style={{ fontWeight: 600 }}>{formatMoney(line?.lineTotal ?? 0, currency)}</div>
                      {line && (line.discount > 0 || line.tax > 0) && <div className="muted" style={{ fontSize: 'var(--text-xs)' }}>{line.discount > 0 && `−${formatMoney(line.discount, currency)} discount `}{line.tax > 0 && `+${formatMoney(line.tax, currency)} tax`}</div>}
                    </div>
                    <Button className="item-remove" iconOnly icon={Trash2} variant="ghost" disabled={fields.length === 1} onClick={() => remove(idx)}>Remove item {idx + 1}</Button>
                  </div>
                )
              })}
              <div className="cluster">
                <Button icon={Plus} onClick={() => append(emptyItem)}>Add item</Button>
                <Button icon={PackagePlus} variant="ghost" onClick={() => setModal('product')}>New product</Button>
              </div>
            </div>
          )}
        </FormZone>

        <FormZone n="3" title="Details" id="z-details">
          <div className="form-grid">
            <Input label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
            <Select label="Status" error={errors.status?.message} {...register('status')}>{INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
            <Select label="Payment method" optional error={errors.paymentMethod?.message} {...register('paymentMethod')}><option value="">Not set</option>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</Select>
            <Textarea wrapperClassName="span-2" label="Notes" optional maxLength={1000} rows={3} error={errors.notes?.message} {...register('notes')} />
            {editing ? (
              <Textarea wrapperClassName="span-2" label="Terms and conditions" maxLength={1000} rows={3} error={errors.termsAndConditions?.message} {...register('termsAndConditions')} />
            ) : (
              <div className="span-2"><span className="label">Terms and conditions</span><p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{business.data.termsAndConditions || 'None set. Add them on the Business page.'}</p></div>
            )}
          </div>
        </FormZone>

        <Totals currency={currency} subTotal={totals.subTotal} totalDiscount={totals.totalDiscount} totalTax={totals.totalTax} grandTotal={totals.grandTotal} note="Estimate. The server calculates the final total." />
      </Sheet>

      <div className="save-bar">
        <span className="tabular save-total">Total {formatMoney(totals.grandTotal, currency)}</span>
        <span className="save-actions">
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting || create.isPending || update.isPending} disabled={noCustomers || noProducts}>{editing ? 'Save changes' : 'Create invoice'}</Button>
        </span>
      </div>

      <ConfirmDialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} onConfirm={() => blocker.proceed?.()} title="Discard your changes?" confirmLabel="Discard" >
        <p>You have unsaved changes on this invoice. Leaving now will lose them.</p>
      </ConfirmDialog>
      <CustomerModal open={modal === 'customer'} onClose={() => setModal(null)} onSaved={(c) => setValue('customerId', c.id, { shouldDirty: true })} />
      <ProductModal open={modal === 'product'} onClose={() => setModal(null)} onSaved={(p) => setValue('items.0.productId', items[0]?.productId || p.id, { shouldDirty: true })} />
    </form>
  )
}
