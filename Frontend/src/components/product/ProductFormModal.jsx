import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../modals/Modal';
import Button from '../common/Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Textarea from '../forms/Textarea';
import Alert from '../feedback/Alert';
import { useToast } from '../feedback/toast-context';
import { createProduct, updateProduct } from '../../api/product.api';
import { productSchema } from '../../lib/schemas';
import { PRODUCT_UNITS } from '../../lib/constants';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { keys } from '../../lib/queryKeys';

export default function ProductFormModal({ open, product, onClose }) {
  const isEdit = Boolean(product);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: product?.productName ?? '',
      description: product?.description ?? '',
      category: product?.category ?? '',
      unit: product?.unit ?? 'piece',
      price: product?.price ?? 0,
      taxRate: product?.taxRate ?? 0,
      discount: product?.discount ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit ? updateProduct(product._id, payload) : createProduct(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.products });
      toast.success(isEdit ? 'Product updated.' : 'Product added.');
      onClose();
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(normalizeError(error).message);
    }
  });

  const num = { valueAsNumber: true };
  return (
    <Modal
      open={open}
      onClose={mutation.isPending ? undefined : onClose}
      title={isEdit ? 'Edit product' : 'Add product'}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
          <Button type="submit" form="product-form" loading={mutation.isPending}>{isEdit ? 'Save changes' : 'Add product'}</Button>
        </>
      )}
    >
      <form id="product-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        {formError && <div className="sm:col-span-2"><Alert tone="error">{formError}</Alert></div>}
        <Input label="Name" required className="sm:col-span-2" data-autofocus error={errors.productName?.message} {...register('productName')} />
        <Textarea label="Description" required className="sm:col-span-2" rows={2} maxLength={500} error={errors.description?.message} {...register('description')} />
        <Input label="Category" required error={errors.category?.message} {...register('category')} />
        <Select label="Unit" required error={errors.unit?.message} {...register('unit')}>
          {PRODUCT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Input label="Price" type="number" step="0.01" min={0} inputMode="decimal" required className="sm:col-span-2" error={errors.price?.message} {...register('price', num)} />
        <Input label="Tax rate (%)" type="number" step="0.01" min={0} max={100} inputMode="decimal" error={errors.taxRate?.message} {...register('taxRate', num)} />
        <Input label="Discount (%)" type="number" step="0.01" min={0} max={100} inputMode="decimal" error={errors.discount?.message} {...register('discount', num)} />
      </form>
    </Modal>
  );
}
