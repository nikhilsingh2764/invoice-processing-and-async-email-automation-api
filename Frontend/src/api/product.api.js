import { client, unwrap } from './client';

// GET /product -> Product[] (not paginated by the backend)
export const listProducts = () => client.get('/product').then(unwrap);
// POST /product
export const createProduct = (body) => client.post('/product', body).then(unwrap);
// PATCH /product/:id
export const updateProduct = (id, body) => client.patch(`/product/${id}`, body).then(unwrap);
// DELETE /product/:id
export const deleteProduct = (id) => client.delete(`/product/${id}`).then(unwrap);
