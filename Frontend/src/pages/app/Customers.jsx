import { ResourcePage } from '../../components/app/ResourcePage.jsx'
import { CustomerModal } from '../../components/forms/CustomerModal.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useCustomers, customerMutations } from '../../hooks/queries.js'
import { qk } from '../../api/queryKeys.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

const searchText = (c) => `${c.customerName} ${c.email} ${c.phone} ${c.companyName} ${c.billingAddress.city}`
const columns = [
  { key: 'customerName', header: 'Customer', sortKey: 'customerName', primary: true, render: (c) => <><span className="cell-primary">{c.customerName}</span>{c.companyName && <span className="cell-secondary">{c.companyName}</span>}</> },
  { key: 'email', header: 'Email', sortKey: 'email', hideSm: true, render: (c) => <span className="cell-trunc" style={{ display: 'block' }}>{c.email}</span> },
  { key: 'phone', header: 'Phone', hideSm: true },
  { key: 'customerType', header: 'Type', sortKey: 'customerType', render: (c) => <Badge tone={c.customerType === 'Business' ? 'info' : undefined}>{c.customerType}</Badge> },
  { key: 'city', header: 'City', hideSm: true, render: (c) => c.billingAddress.city },
]

export default function Customers() {
  useDocumentTitle('Customers')
  return (
    <ResourcePage
      title="Customers" noun="customer" nounPlural="customers" description="The people and companies you bill."
      crumbs={[{ to: '/dashboard', label: 'Dashboard' }, { label: 'Customers' }]}
      query={useCustomers()} listKey={qk.customers} remove={customerMutations.useRemove()}
      columns={columns} searchText={searchText} nameOf={(c) => c.customerName} Modal={CustomerModal}
      emptyText="Add a customer to start invoicing."
    />
  )
}
