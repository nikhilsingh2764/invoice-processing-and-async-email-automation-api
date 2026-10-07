import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Textarea from '../../components/forms/Textarea';
import AddressFields from '../../components/forms/AddressFields';
import ConfirmDialog from '../../components/modals/ConfirmDialog';
import Alert from '../../components/feedback/Alert';
import ErrorState from '../../components/feedback/ErrorState';
import { SkeletonRows } from '../../components/feedback/Skeleton';
import { useToast } from '../../components/feedback/toast-context';
import { useBusiness } from '../../hooks/queries';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { createBusiness, deleteBusiness, updateBusiness } from '../../api/business.api';
import { businessSchema, emptyAddress } from '../../lib/schemas';
import { CURRENCIES } from '../../lib/constants';
import { applyFieldErrors, getErrorMessage, normalizeError } from '../../lib/errors';
import { stripEmpty } from '../../lib/payload';
import { keys } from '../../lib/queryKeys';

function BusinessForm({ business }) {
  const isEdit = Boolean(business);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: business?.businessName ?? '',
      ownerName: business?.ownerName ?? '',
      email: business?.email ?? '',
      phone: business?.phone ?? '',
      gstNumber: business?.gstNumber ?? '',
      address: { ...emptyAddress, ...(business?.address ?? {}), addressLine2: business?.address?.addressLine2 ?? '' },
      currency: business?.currency ?? 'INR',
      invoicePrefix: business?.invoicePrefix ?? 'INV',
      invoiceStartNumber: business?.invoiceStartNumber ?? 1,
      logo: business?.logo ?? '',
      signature: business?.signature ?? '',
      termsAndConditions: business?.termsAndConditions ?? '',
    },
  });

  const save = useMutation({
    mutationFn: (payload) => (isEdit ? updateBusiness(payload) : createBusiness(payload)),
    onSuccess: (saved) => {
      queryClient.setQueryData(keys.business, saved);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isEdit ? 'Business profile updated.' : 'Business profile created.');
    },
  });

  const remove = useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => { queryClient.setQueryData(keys.business, null); toast.success('Business profile deleted.'); setConfirmDelete(false); },
    onError: (e) => { toast.error(getErrorMessage(e)); setConfirmDelete(false); },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      await save.mutateAsync(stripEmpty(values));
    } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(normalizeError(error).message);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {formError && <Alert tone="error">{formError}</Alert>}
      <Card>
        <CardHeader title="Business details" description="Shown on every invoice you issue." />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input label="Business name" required error={errors.businessName?.message} {...register('businessName')} />
          <Input label="Owner name" required error={errors.ownerName?.message} {...register('ownerName')} />
          <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
          <Input label="Phone" type="tel" inputMode="numeric" maxLength={10} required hint="10 digits" error={errors.phone?.message} {...register('phone')} />
          <Input label="GST number" maxLength={15} error={errors.gstNumber?.message} {...register('gstNumber')} />
          <Select label="Currency" required error={errors.currency?.message} {...register('currency')}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Address" />
        <CardBody><AddressFields prefix="address" register={register} errors={errors} /></CardBody>
      </Card>
      <Card>
        <CardHeader title="Invoice settings" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input label="Invoice prefix" maxLength={10} hint="2–10 characters, e.g. INV" error={errors.invoicePrefix?.message} {...register('invoicePrefix')} />
          <Input label="Invoice counter" type="number" min={1} step={1} inputMode="numeric"
            hint="The backend increments this before each invoice, so the next invoice uses this value + 1."
            error={errors.invoiceStartNumber?.message} {...register('invoiceStartNumber', { valueAsNumber: true })} />
          <Input label="Logo URL" type="url" className="sm:col-span-2" error={errors.logo?.message} {...register('logo')} />
          <Input label="Signature URL" type="url" className="sm:col-span-2" error={errors.signature?.message} {...register('signature')} />
          <Textarea label="Default terms & conditions" className="sm:col-span-2" rows={3} maxLength={1000} error={errors.termsAndConditions?.message} {...register('termsAndConditions')} />
        </CardBody>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isEdit ? (
          <Button variant="dangerOutline" onClick={() => setConfirmDelete(true)}><Trash2 className="size-4" aria-hidden /> Delete profile</Button>
        ) : <span />}
        <Button type="submit" loading={save.isPending}>{isEdit ? 'Save changes' : 'Create business profile'}</Button>
      </div>
      <ConfirmDialog open={confirmDelete} title="Delete business profile?"
        message="You will not be able to create invoices until you create a new profile. Existing invoices are kept."
        confirmLabel="Delete profile" loading={remove.isPending} onConfirm={() => remove.mutate()} onCancel={() => setConfirmDelete(false)} />
    </form>
  );
}

export default function BusinessPage() {
  useDocumentTitle('Business');
  const { data, error, isPending, isFetching, refetch } = useBusiness();
  return (
    <>
      <PageHeader title="Business profile" description={data ? 'Update the details printed on your invoices.' : 'Set up your business to start invoicing.'} />
      {isPending ? <Card><SkeletonRows rows={6} /></Card>
        : error ? <Card><ErrorState title="We couldn’t load your business profile" error={error} onRetry={refetch} retrying={isFetching} /></Card>
        : (
          <>
            {!data && <Alert tone="info" className="mb-6" title="Welcome!"><span className="inline-flex items-center gap-1.5"><Building2 className="size-4" aria-hidden /> Create your business profile first — it is required before you can create invoices.</span></Alert>}
            <BusinessForm key={data?.updatedAt ?? 'new'} business={data} />
          </>
        )}
    </>
  );
}
