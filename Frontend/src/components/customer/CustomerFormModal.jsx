import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../modals/Modal';
import Button from '../common/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Textarea from '../forms/Textarea';
import AddressFields from '../forms/AddressFields';
import Alert from '../feedback/Alert';
import { useToast } from '../feedback/toast-context';
import { createCustomer, updateCustomer } from '../../api/customer.api';
import { customerSchema, emptyAddress } from '../../lib/schemas';
import { CUSTOMER_TYPES } from '../../lib/constants';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { stripEmpty } from '../../lib/payload';
import { keys } from '../../lib/queryKeys';

const pickAddress = (a) => ({ ...emptyAddress, ...(a ?? {}), addressLine2: a?.addressLine2 ?? '' });

function defaultsFor(c) {
  return {
    customerName: c?.customerName ?? '',
    email: c?.email ?? '',
    phone: c?.phone ?? '',
    companyName: c?.companyName ?? '',
    gstNumber: c?.gstNumber ?? '',
    customerType: c?.customerType?.trim() || 'Business',
    notes: c?.notes ?? '',
    billingAddress: pickAddress(c?.billingAddress),
    shippingDifferent: Boolean(c?.shippingAddress),
    shippingAddress: pickAddress(c?.shippingAddress),
  };
}

export default function CustomerFormModal({ open, customer, onClose }) {
  const isEdit = Boolean(customer);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, control, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultsFor(customer),
  });
  const shippingDifferent = useWatch({ control, name: 'shippingDifferent' });

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit ? updateCustomer(customer._id, payload) : createCustomer(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.customers });
      toast.success(isEdit ? 'Customer updated.' : 'Customer added.');
      onClose();
    },
  });

  const onSubmit = handleSubmit(async ({ shippingDifferent: diff, shippingAddress, ...values }) => {
    setFormError('');
    const payload = stripEmpty({ ...values, ...(diff && { shippingAddress }) });
    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(normalizeError(error).message);
    }
  });

  return (
    <Modal
      open={open}
      onClose={mutation.isPending ? undefined : onClose}
      title={isEdit ? 'Edit customer' : 'Add customer'}
      size="lg"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" form="customer-form" loading={mutation.isPending}>{isEdit ? 'Save changes' : 'Add customer'}</Button>
        </>
      )}
    >
      <form id="customer-form" onSubmit={onSubmit} noValidate className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" required data-autofocus error={errors.customerName?.message} {...register('customerName')} />
          <Select label="Type" required error={errors.customerType?.message} {...register('customerType')}>
            {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Email" type="email" required autoComplete="off" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" type="tel" inputMode="numeric" maxLength={10} required hint="10 digits" error={errors.phone?.message} {...register('phone')} />
          <Input label="Company" error={errors.companyName?.message} {...register('companyName')} />
          <Input label="GST number" maxLength={15} error={errors.gstNumber?.message} {...register('gstNumber')} />
          <Textarea label="Notes" className="sm:col-span-2" rows={2} maxLength={500} error={errors.notes?.message} {...register('notes')} />
        </div>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-fg">Billing address</legend>
          <AddressFields prefix="billingAddress" register={register} errors={errors} />
        </fieldset>
        <label className="flex items-center gap-2.5 text-sm text-fg">
          <input type="checkbox" className="size-4 accent-[var(--brand)]" {...register('shippingDifferent')} />
          Shipping address is different
        </label>
        {shippingDifferent && (
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-fg">Shipping address</legend>
            <AddressFields prefix="shippingAddress" register={register} errors={errors} />
          </fieldset>
        )}
      </form>
    </Modal>
  );
}
