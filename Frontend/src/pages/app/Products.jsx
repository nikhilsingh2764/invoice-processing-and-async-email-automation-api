import { ResourcePage } from '../../components/app/ResourcePage.jsx'
import { ProductModal } from '../../components/forms/ProductModal.jsx'
import { useBusiness, useProducts, productMutations } from '../../hooks/queries.js'
import { qk } from '../../api/queryKeys.js'
import { formatMoney } from '../../lib/format.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

const searchText = (p) => `${p.productName} ${p.category} ${p.description}`

export default function Products() {
  useDocumentTitle('Products')
  const currency = useBusiness().data?.currency || 'INR'
  const columns = [
    { key: 'productName', header: 'Product', sortKey: 'productName', primary: true, render: (p) => <><span className="cell-primary">{p.productName}</span><span className="cell-secondary cell-trunc">{p.description}</span></> },
    { key: 'category', header: 'Category', sortKey: 'category', hideSm: true },
    { key: 'unit', header: 'Unit', hideSm: true },
    { key: 'taxRate', header: 'Tax', sortKey: 'taxRate', num: true, hideSm: true, render: (p) => `${p.taxRate}%` },
    { key: 'price', header: 'Price', sortKey: 'price', num: true, render: (p) => formatMoney(p.price, currency) },
  ]
  return (
    <ResourcePage
      title="Products" noun="product" nounPlural="products" description="Items and services you can add to invoices."
      crumbs={[{ to: '/dashboard', label: 'Dashboard' }, { label: 'Products' }]}
      query={useProducts()} listKey={qk.products} remove={productMutations.useRemove()}
      columns={columns} searchText={searchText} nameOf={(p) => p.productName} Modal={ProductModal}
      emptyText="Add the products or services you sell."
    />
  )
}
