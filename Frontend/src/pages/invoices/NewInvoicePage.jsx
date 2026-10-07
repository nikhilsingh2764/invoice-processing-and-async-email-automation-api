import PageHeader from '../../components/common/PageHeader';
import InvoiceForm from '../../components/invoice/InvoiceForm';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NewInvoicePage() {
  useDocumentTitle('New invoice');
  return (
    <>
      <PageHeader title="New invoice" description="Pick a customer, add items and set a due date." />
      <InvoiceForm />
    </>
  );
}
