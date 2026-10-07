import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import InvoiceForm from '../../components/invoice/InvoiceForm';
import ErrorState from '../../components/feedback/ErrorState';
import { Card } from '../../components/common/Card';
import { SkeletonRows } from '../../components/feedback/Skeleton';
import { useInvoice } from '../../hooks/queries';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function EditInvoicePage() {
  const { id } = useParams();
  const { data, error, isPending, refetch, isFetching } = useInvoice(id);
  useDocumentTitle(data ? `Edit ${data.invoiceNumber}` : 'Edit invoice');

  return (
    <>
      <PageHeader title={data ? `Edit ${data.invoiceNumber}` : 'Edit invoice'} />
      {isPending ? <Card><SkeletonRows rows={6} /></Card>
        : error ? <Card><ErrorState title="We couldn’t load this invoice" error={error} onRetry={refetch} retrying={isFetching} /></Card>
        : <InvoiceForm invoice={data} key={data.updatedAt} />}
    </>
  );
}
