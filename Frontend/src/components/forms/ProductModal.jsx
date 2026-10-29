import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Alert } from '../ui/Alert.jsx'
import { Input, Select, Textarea } from '../ui/FormField.jsx'
import { productSchema } from '../../lib/validators.js'
import { productMutations } from '../../hooks/queries.js'
import { applyServerErrors } from '../../lib/forms.js'
import { normalizeError } from '../../api/errors.js'
import { UNITS } from '../../config/enums.js'
import { useToast } from '../ui/Toast.jsx'

const toForm = (p) => (p ? { productName: p.productName, description: p.description, category: p.category, unit: p.unit, price: p.price, taxRate: p.taxRate, discount: p.discount } : { productName: '', description: '', category: '', unit: 'piece', price: '', taxRate: 0, discount: 0 })

export function ProductModal({ open, onClose, product, onSaved }) {
  const toast = useToast()
  const create = productMutations.useCreate()
  const update = productMutations.useUpdate()
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, setError: setFieldError, setFocus, formState: { errors } } = useForm({ resolver: zodResolver(productSchema), defaultValues: toForm(product) })
  useEffect(() => {
    if (open) {
      reset(toForm(product))
      setError('')
    }
  }, [open, product, reset])
  const busy = create.isPending || update.isPending

  const submit = handleSubmit(
    async (values) => {
      setError('')
      try {
        const saved = product ? await update.mutateAsync({ id: product.id, values }) : await create.mutateAsync(values)
        toast.success(product ? 'Product updated' : 'Product added')
        onSaved?.(saved)
        onClose()
      } catch (e) {
        if (!applyServerErrors(setFieldError, e)) setError(normalizeError(e).message)
      }
    },
    (errs) => setFocus(Object.keys(errs)[0]),
  )

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} dismissible={!busy}>
      <Modal.Header title={product ? 'Edit product' : 'Add product'} description="Price is per unit. Tax and discount are percentages." />
      <form onSubmit={submit} noValidate>
        <Modal.Body>
          <div className="stack">
            {error && <Alert tone="danger">{error}</Alert>}
            <Input label="Product name" error={errors.productName?.message} {...register('productName')} />
            <Textarea label="Description" maxLength={500} error={errors.description?.message} {...register('description')} />
            <div className="form-grid">
              <Input label="Category" error={errors.category?.message} {...register('category')} />
              <Select label="Unit" error={errors.unit?.message} {...register('unit')}>{UNITS.map((u) => <option key={u}>{u}</option>)}</Select>
            </div>
            <div className="form-grid" data-cols="3">
              <Input label="Price" type="number" inputMode="decimal" step="0.01" min="0" error={errors.price?.message} {...register('price')} />
              <Input label="Tax rate (%)" type="number" inputMode="decimal" step="0.01" min="0" max="100" error={errors.taxRate?.message} {...register('taxRate')} />
              <Input label="Discount (%)" type="number" inputMode="decimal" step="0.01" min="0" max="100" error={errors.discount?.message} {...register('discount')} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" variant="primary" loading={busy}>{product ? 'Save changes' : 'Add product'}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
