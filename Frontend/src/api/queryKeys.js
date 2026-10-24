// Factory: every query key in the app is built here.
export const qk = {
  profile: () => ['profile'],
  business: () => ['business'],
  customers: () => ['customers'],
  customer: (id) => ['customer', id],
  products: () => ['products'],
  product: (id) => ['product', id],
  invoice: (id) => ['invoice', id],
  dashboardRoot: () => ['dashboard'],
  dashboard: (params = {}) => ['dashboard', params],
  attention: () => ['dashboard', 'attention'],
  health: () => ['health'],
}
