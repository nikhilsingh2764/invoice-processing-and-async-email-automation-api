export const keys = {
  profile: ['profile'],
  business: ['business'],
  customers: ['customers'],
  products: ['products'],
  invoice: (id) => ['invoice', id],
  dashboard: (params = {}) => ['dashboard', params],
};
