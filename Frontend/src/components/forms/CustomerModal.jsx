import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Alert } from '../ui/Alert.jsx'
import { Input, Select, Switch, Textarea } from '../ui/FormField.jsx'
import { AddressFields } from './AddressFields.jsx'
import { customerSchema } from '../../lib/validators.js'
import { customerMutations } from '../../hooks/queries.js'
import { applyServerErrors } from '../../lib/forms.js'
import { normalizeError } from '../../api/errors.js'
import { CUSTOMER_TYPES } from '../../config/enums.js'
import { useToast } from '../ui/Toast.jsx'

const blank = { addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', postalCode: '' }
const toForm = (c) =>
  c
    ? { customerName: c.customerName, email: c.email, phone: c.phone, companyName: c.companyName, gstNumber: c.gstNumber, customerType: c.customerType, notes: c.notes, billingAddress: c.billingAddress, shippingSame: !c.shippingAddress, shippingAddress: c.shippingAddress || blank }
    : { customerName: '', email: '', phone: '', companyName: '', gstNumber: '', customerType: 'Individual', notes: '', billingAddress: blank, shippingSame: true, shippingAddress: blank }

export function CustomerModal({ open, onClose, customer, onSaved }) {
  const toast = useToast()
  const create = customerMutations.useCreate()
  const update = customerMutations.useUpdate()
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, reset, setError: setFieldError, setFocus, formState: { errors } } = useForm({ resolver: zodResolver(customerSchema), defaultValues: toForm(customer) })
  useEffect(() => {
    if (open) {
      reset(toForm(customer))
      setError('')
    }
  }, [open, customer, reset])
  const same = watch('shippingSame')
  const busy = create.isPending || update.isPending

  const submit = handleSubmit(
    async (values) => {
      setError('')
      try {
        const saved = customer ? await update.mutateAsync({ id: customer.id, values }) : await create.mutateAsync(values)
        toast.success(customer ? 'Customer updated' : 'Customer added')
        onSaved?.(saved)
        onClose()
      } catch (e) {
        if (!applyServerErrors(setFieldError, e)) setError(normalizeError(e).message)
      }
    },
    (errs) => setFocus(Object.keys(errs)[0]),
  )

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} size="lg" dismissible={!busy}>
      <Modal.Header title={customer ? 'Edit customer' : 'Add customer'} description="Billing address is required. Shipping defaults to the same address." />
      <form onSubmit={submit} noValidate>
        <Modal.Body>
          <div className="stack">
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="form-grid">
              <Input label="Customer name" autoComplete="off" error={errors.customerName?.message} {...register('customerName')} />
              <Select label="Type" error={errors.customerType?.message} {...register('customerType')}>{CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
              <Input label="Email" type="email" inputMode="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" inputMode="numeric" maxLength={10} hint="10 digits" autoComplete="off" error={errors.phone?.message} {...register('phone')} />
              <Input label="Company" optional error={errors.companyName?.message} {...register('companyName')} />
              <Input label="GST number" optional maxLength={15} error={errors.gstNumber?.message} {...register('gstNumber')} />
            </div>
            <AddressFields prefix="billingAddress" register={register} errors={errors.billingAddress} legend="Billing address" />
            <Switch label="Shipping address is the same as billing" {...register('shippingSame')} />
            {!same && <AddressFields prefix="shippingAddress" register={register} errors={errors.shippingAddress} legend="Shipping address" />}
            <Textarea label="Notes" optional maxLength={500} error={errors.notes?.message} {...register('notes')} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" variant="primary" loading={busy}>{customer ? 'Save changes' : 'Add customer'}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
