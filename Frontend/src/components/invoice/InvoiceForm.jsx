import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../common/Card';
import Button from '../common/Button';
import { buttonClasses } from '../common/button-styles';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Textarea from '../forms/Textarea';
import Field from '../forms/Field';
import Alert from '../feedback/Alert';
import ErrorState from '../feedback/ErrorState';
import { SkeletonRows } from '../feedback/Skeleton';
import { useToast } from '../feedback/toast-context';
import { useBusiness, useCustomers, useProducts } from '../../hooks/queries';
import { createInvoice, updateInvoice } from '../../api/invoice.api';
import { INVOICE_STATUSES, PAYMENT_METHODS } from '../../lib/constants';
import { makeInvoiceSchema } from '../../lib/schemas';
import { estimateTotals, lineAmounts } from '../../lib/invoiceMath';
import { formatMoney, toDateInputValue } from '../../lib/format';
import { applyFieldErrors, normalizeError } from '../../lib/errors';
import { keys } from '../../lib/queryKeys';
import { markListsStale } from '../../lib/staleNotice';

const plusDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const sameItems = (a, b) => a.length === b.length && a.every((x, i) => x.productId === b[i].productId && x.quantity === b[i].quantity);

function buildDefaults(invoice) {
  if (!invoice) {
    return { customerId: '', items: [{ productId: '', quantity: 1 }], dueDate: plusDays(30), status: 'Pending', paymentMethod: '', notes: '', termsAndConditions: '' };
  }
  return {
    customerId: '',
    items: invoice.items.map((i) => ({ productId: String(i.productId), quantity: i.quantity })),
    dueDate: toDateInputValue(invoice.dueDate),
    status: invoice.status,
    paymentMethod: invoice.paymentMethod ?? '',
    notes: invoice.notes ?? '',
    termsAndConditions: invoice.termsAndConditions ?? '',
  };
}

function Prerequisite({ title, to, linkLabel, children }) {
  return (
    <Alert tone="warning" title={title} action={<Link to={to} className="font-semibold underline">{linkLabel}</Link>}>{children}</Alert>
  );
}

export default function InvoiceForm({ invoice }) {
  const isEdit = Boolean(invoice);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState('');

  const customers = useCustomers();
  const products = useProducts();
  const business = useBusiness();

  const schema = useMemo(() => makeInvoiceSchema(isEdit), [isEdit]);
  const defaults = useMemo(() => buildDefaults(invoice), [invoice]);

  const { register, control, handleSubmit, setError, formState: { errors, dirtyFields } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatchedItems(control);

  const productList = useMemo(() => products.data ?? [], [products.data]);
  const productsById = useMemo(() => new Map(productList.map((p) => [p._id, p])), [productList]);
  const currency = isEdit ? invoice.business?.currency : business.data?.currency;
  const totals = estimateTotals(watchedItems, productsById);
  const itemsChanged = isEdit && !sameItems(watchedItems.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })), defaults.items);

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit ? updateInvoice(invoice._id, payload) : createInvoice(payload)),
    onSuccess: (saved) => {
      markListsStale();
      queryClient.setQueryData(keys.invoice(saved._id), saved);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isEdit ? 'Invoice updated.' : `Invoice ${saved.invoiceNumber} created.`);
      navigate(`/invoices/${saved._id}`, { replace: isEdit });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    const items = values.items.map(({ productId, quantity }) => ({ productId, quantity }));
    let payload;
    if (!isEdit) {
      payload = {
        customerId: values.customerId,
        items,
        dueDate: values.dueDate,
        status: values.status,
        ...(values.paymentMethod && { paymentMethod: values.paymentMethod }),
        ...(values.notes && { notes: values.notes }),
      };
    } else {
      payload = {};
      if (values.customerId) payload.customerId = values.customerId;
      if (itemsChanged) payload.items = items;
      if (dirtyFields.dueDate) payload.dueDate = values.dueDate;
      if (dirtyFields.status) payload.status = values.status;
      if (dirtyFields.paymentMethod && values.paymentMethod) payload.paymentMethod = values.paymentMethod;
      if (dirtyFields.notes) payload.notes = values.notes;
      if (dirtyFields.termsAndConditions) payload.termsAndConditions = values.termsAndConditions;
      if (Object.keys(payload).length === 0) {
        toast.info('There are no changes to save.');
        return;
      }
    }
    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      if (!applyFieldErrors(error, setError, ['customerId', 'dueDate', 'status', 'paymentMethod', 'notes', 'termsAndConditions'])) {
        setFormError(normalizeError(error).message);
      }
    }
  });

  const loading = customers.isPending || products.isPending || (!isEdit && business.isPending);
  const loadError = customers.error || products.error || (!isEdit && business.error);
  if (loading) return <Card><SkeletonRows rows={6} /></Card>;
  if (loadError) {
    return (
      <Card>
        <ErrorState title="We couldn’t load the data needed for this form" error={loadError}
          onRetry={() => { customers.refetch(); products.refetch(); business.refetch(); }} />
      </Card>
    );
  }

  const customerList = [...(customers.data ?? [])].sort((a, b) => a.customerName.localeCompare(b.customerName));
  const missingProductNames = new Map((invoice?.items ?? []).filter((i) => !productsById.has(String(i.productId))).map((i) => [String(i.productId), i.productName]));

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {!isEdit && !business.data && (
          <Prerequisite title="Business profile required" to="/business" linkLabel="Set up your business profile">
            The backend needs it to number your invoices.
          </Prerequisite>
        )}
        {!isEdit && customerList.length === 0 && (
          <Prerequisite title="No customers yet" to="/customers" linkLabel="Add a customer">Invoices are issued to a customer.</Prerequisite>
        )}
        {productList.length === 0 && (
          <Prerequisite title="No products yet" to="/products" linkLabel="Add a product">Invoice lines are built from your products.</Prerequisite>
        )}
        {formError && <Alert tone="error">{formError}</Alert>}

        <Card>
          <CardHeader title="Details" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Customer"
              required={!isEdit}
              className="sm:col-span-2"
              error={errors.customerId?.message}
              hint={isEdit ? 'Choose another customer to replace the one on this invoice.' : undefined}
              {...register('customerId')}
            >
              <option value="">{isEdit ? `Keep current: ${invoice.customer?.customerName ?? 'customer'}` : 'Select a customer…'}</option>
              {customerList.map((c) => (
                <option key={c._id} value={c._id}>{c.customerName}{c.companyName ? ` · ${c.companyName}` : ''}</option>
              ))}
            </Select>
            <Input label="Due date" type="date" required error={errors.dueDate?.message} {...register('dueDate')} />
            <Select label="Status" required error={errors.status?.message} {...register('status')}>
              {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Payment method" error={errors.paymentMethod?.message} className="sm:col-span-2"
              hint={isEdit && invoice.paymentMethod ? 'A payment method, once set, can be changed but not cleared.' : undefined}
              {...register('paymentMethod')}>
              <option value="">Not specified</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Items"
            description="Prices, tax and discount come from each product."
            action={<Button variant="secondary" size="sm" onClick={() => append({ productId: '', quantity: 1 })}><Plus className="size-4" aria-hidden /> Add item</Button>}
          />
          <CardBody className="space-y-4">
            {itemsChanged && (
              <Alert tone="info">Saving item changes re-prices every line using the <strong>current</strong> product prices.</Alert>
            )}
            {typeof errors.items?.message === 'string' && <p role="alert" className="text-sm text-danger">{errors.items.message}</p>}
            {fields.map((field, index) => {
              const item = watchedItems[index];
              const product = productsById.get(item?.productId);
              const line = lineAmounts(product, item?.quantity);
              const missingName = missingProductNames.get(item?.productId);
              return (
                <div key={field.id} className="grid gap-3 rounded-xl border border-line bg-surface-2/40 p-3 sm:grid-cols-[1fr_7rem_auto_auto] sm:items-start sm:border-0 sm:bg-transparent sm:p-0">
                  <Select
                    label={index === 0 ? 'Product' : undefined}
                    aria-label={`Product for item ${index + 1}`}
                    error={errors.items?.[index]?.productId?.message ?? (missingName ? `“${missingName}” no longer exists — choose another product.` : undefined)}
                    {...register(`items.${index}.productId`)}
                  >
                    <option value="">Select a product…</option>
                    {productList.map((p) => (
                      <option key={p._id} value={p._id}>{p.productName} — {formatMoney(p.price, currency)} / {p.unit}</option>
                    ))}
                    {missingName && <option value={item.productId}>{missingName} (unavailable)</option>}
                  </Select>
                  <Input
                    label={index === 0 ? 'Qty' : undefined}
                    aria-label={`Quantity for item ${index + 1}`}
                    type="number" min={1} step={1} inputMode="numeric"
                    error={errors.items?.[index]?.quantity?.message}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <div className={`flex items-center sm:h-10 sm:min-w-28 sm:justify-end ${index === 0 ? 'sm:mt-[1.625rem]' : ''}`}>
                    <span className="text-sm font-medium tabular-nums text-fg" aria-label={`Line total for item ${index + 1}`}>
                      {product ? formatMoney(line.total, currency) : '—'}
                    </span>
                  </div>
                  <div className={index === 0 ? 'sm:mt-[1.625rem]' : ''}>
                    <Button variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} aria-label={`Remove item ${index + 1}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Notes" />
          <CardBody className="space-y-4">
            <Textarea label="Notes" rows={3} maxLength={1000} placeholder="Visible on the invoice (optional)" error={errors.notes?.message} {...register('notes')} />
            {isEdit ? (
              <Textarea label="Terms & conditions" rows={3} maxLength={2000} error={errors.termsAndConditions?.message} {...register('termsAndConditions')} />
            ) : (
              <Field id="terms-info" hint="New invoices automatically use the terms from your business profile.">
                <span className="text-sm font-medium text-fg">Terms & conditions</span>
              </Field>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24">
        <Card>
          <CardHeader title="Summary" description="Estimate — final amounts are calculated by the server." />
          <CardBody>
            <dl className="space-y-2.5 text-sm">
              <Row label="Subtotal" value={formatMoney(totals.subTotal, currency)} />
              <Row label="Discount" value={`− ${formatMoney(totals.totalDiscount, currency)}`} />
              <Row label="Tax" value={formatMoney(totals.totalTax, currency)} />
              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                <dt className="font-semibold text-fg">Total</dt>
                <dd className="text-xl font-semibold tabular-nums text-fg">{formatMoney(totals.grandTotal, currency)}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button type="submit" loading={mutation.isPending} className="flex-1">{isEdit ? 'Save changes' : 'Create invoice'}</Button>
          <Link to={isEdit ? `/invoices/${invoice._id}` : '/invoices'} className={buttonClasses({ variant: 'secondary', className: 'flex-1' })}>Cancel</Link>
        </div>
      </div>
    </form>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="font-medium tabular-nums text-fg">{value}</dd>
    </div>
  );
}

function useWatchedItems(control) {
  return useWatch({ control, name: 'items' }) ?? [];
}
