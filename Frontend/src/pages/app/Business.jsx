import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Sheet, Letterhead, FormZone } from '../../components/sheet/index.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select, Textarea } from '../../components/ui/FormField.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { CardSkeleton } from '../../components/ui/Skeleton.jsx'
import { ErrorState } from '../../components/ui/EmptyState.jsx'
import { AddressFields } from '../../components/forms/AddressFields.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { useBusiness, useSaveBusiness } from '../../hooks/queries.js'
import { businessApi } from '../../api/endpoints.js'
import { qk } from '../../api/queryKeys.js'
import { normalizeError } from '../../api/errors.js'
import { applyServerErrors } from '../../lib/forms.js'
import { businessSchema } from '../../lib/validators.js'
import { nextInvoiceNumber } from '../../lib/money.js'
import { CURRENCIES } from '../../config/enums.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

const blankAddress = { addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '' }
const blank = { businessName: '', ownerName: '', email: '', phone: '', gstNumber: '', address: blankAddress, currency: 'INR', logo: '', signature: '', invoicePrefix: 'INV', invoiceStartNumber: 1, termsAndConditions: '' }
const toForm = (b) => (b ? { ...b, gstNumber: b.gstNumber || '', logo: b.logo || '', signature: b.signature || '' } : blank)

export default function Business() {
  useDocumentTitle('Business')
  const toast = useToast()
  const qc = useQueryClient()
  const q = useBusiness()
  const save = useSaveBusiness()
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [typed, setTyped] = useState('')
  const [busyDelete, setBusyDelete] = useState(false)
  const exists = Boolean(q.data)
  const { register, handleSubmit, reset, watch, setError: setFieldError, setFocus, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(businessSchema), defaultValues: toForm(q.data) })
  useEffect(() => { if (!q.isLoading) reset(toForm(q.data)) }, [q.data, q.isLoading, reset])

  const submit = handleSubmit(
    async (values) => {
      setError('')
      try {
        await save.mutateAsync({ exists, values })
        toast.success(exists ? 'Business updated' : 'Business created')
      } catch (e) {
        if (!applyServerErrors(setFieldError, e)) setError(normalizeError(e).message)
      }
    },
    (errs) => setFocus(Object.keys(errs)[0]),
  )

  const removeBusiness = async () => {
    setBusyDelete(true)
    try {
      await businessApi.remove()
      qc.setQueryData(qk.business(), null)
      qc.invalidateQueries({ queryKey: qk.dashboardRoot() })
      toast.success('Business deleted')
      setDeleting(false)
    } catch (e) {
      toast.error('Could not delete the business', normalizeError(e).message)
    } finally {
      setBusyDelete(false)
    }
  }

  if (q.isLoading) return <div className="stack-lg"><Letterhead title="Business" /><CardSkeleton height={360} /></div>
  if (q.isError) return <ErrorState message={normalizeError(q.error).message} onRetry={() => q.refetch()} />

  return (
    <div className="stack-lg">
      <Letterhead title="Business" description={exists ? 'These details appear on every new invoice.' : 'Set up your business to start invoicing.'} crumbs={[{ to: '/dashboard', label: 'Dashboard' }, { label: 'Business' }]} />
      {error && <Alert tone="danger">{error}</Alert>}
      <form onSubmit={submit} noValidate>
        <Sheet>
          <FormZone n="1" title="Identity" id="b-id">
            <div className="form-grid">
              <Input label="Business name" error={errors.businessName?.message} {...register('businessName')} />
              <Input label="Owner name" error={errors.ownerName?.message} {...register('ownerName')} />
              <Input label="Email" type="email" inputMode="email" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" inputMode="numeric" maxLength={10} hint="10 digits" error={errors.phone?.message} {...register('phone')} />
              <Input label="GST number" optional maxLength={15} error={errors.gstNumber?.message} {...register('gstNumber')} />
              <Select label="Currency" error={errors.currency?.message} {...register('currency')}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</Select>
            </div>
          </FormZone>
          <FormZone n="2" title="Address" id="b-addr"><AddressFields prefix="address" register={register} errors={errors.address} /></FormZone>
          <FormZone n="3" title="Invoice numbering" id="b-num" description="The server counts up before using a number, so your first invoice is the start number plus one.">
            <div className="form-grid">
              <Input label="Prefix" maxLength={10} error={errors.invoicePrefix?.message} {...register('invoicePrefix')} />
              <Input label="Start number" type="number" min="1" inputMode="numeric" error={errors.invoiceStartNumber?.message} {...register('invoiceStartNumber')} />
            </div>
            <p className="muted" aria-live="polite">Next invoice: <strong className="tabular">{exists && q.data.nextInvoiceNumber ? `${q.data.invoicePrefix}-${q.data.nextInvoiceNumber}` : nextInvoiceNumber(watch('invoicePrefix'), Number(watch('invoiceStartNumber')) || 1)}</strong></p>
          </FormZone>
          <FormZone n="4" title="Branding and terms" id="b-brand">
            <div className="form-grid">
              <Input wrapperClassName="span-2" label="Logo link" optional type="url" placeholder="https://…" hint="A secure https:// link to an image" error={errors.logo?.message} {...register('logo')} />
              <Input wrapperClassName="span-2" label="Signature text" optional maxLength={500} error={errors.signature?.message} {...register('signature')} />
              <Textarea wrapperClassName="span-2" label="Terms and conditions" optional rows={4} maxLength={1000} error={errors.termsAndConditions?.message} {...register('termsAndConditions')} />
            </div>
          </FormZone>
        </Sheet>
        <div className="save-bar">
          <span className="muted">{isDirty ? 'You have unsaved changes.' : 'All changes saved.'}</span>
          <Button type="submit" variant="primary" loading={save.isPending}>{exists ? 'Save changes' : 'Create business'}</Button>
        </div>
      </form>

      {exists && (
        <section className="card" data-tone="danger" aria-labelledby="danger-h">
          <h2 className="card-title" id="danger-h">Delete business</h2>
          <p className="card-desc">Removes your business profile. Existing invoices keep their own copy, but you cannot create new ones until you set up a business again.</p>
          <Button variant="danger" onClick={() => (setTyped(''), setDeleting(true))}>Delete business…</Button>
        </section>
      )}
      <Modal open={deleting} onClose={busyDelete ? undefined : () => setDeleting(false)} size="sm" dismissible={!busyDelete}>
        <Modal.Header title="Delete your business?" />
        <Modal.Body>
          <div className="stack">
            <Alert tone="danger">This cannot be undone.</Alert>
            <Input label={`Type ${q.data?.businessName} to confirm`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" data-autofocus />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setDeleting(false)} disabled={busyDelete}>Cancel</Button>
          <Button variant="danger" loading={busyDelete} disabled={typed.trim() !== q.data?.businessName} onClick={removeBusiness}>Delete business</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
