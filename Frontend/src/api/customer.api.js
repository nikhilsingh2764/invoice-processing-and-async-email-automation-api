import { client, unwrap } from './client';

// GET /customer -> Customer[] (not paginated by the backend)
export const listCustomers = () => client.get('/customer').then(unwrap);
// POST /customer
export const createCustomer = (body) => client.post('/customer', body).then(unwrap);
// PATCH /customer/:id
export const updateCustomer = (id, body) => client.patch(`/customer/${id}`, body).then(unwrap);
// DELETE /customer/:id
export const deleteCustomer = (id) => client.delete(`/customer/${id}`).then(unwrap);
