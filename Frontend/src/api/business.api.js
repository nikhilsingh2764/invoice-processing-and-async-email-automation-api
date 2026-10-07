import { client, unwrap } from './client';

// GET /business -> business profile (404 when none exists yet)
export const getBusiness = () => client.get('/business').then(unwrap);
// POST /business
export const createBusiness = (body) => client.post('/business', body).then(unwrap);
// PATCH /business
export const updateBusiness = (body) => client.patch('/business', body).then(unwrap);
// DELETE /business
export const deleteBusiness = () => client.delete('/business').then(unwrap);
