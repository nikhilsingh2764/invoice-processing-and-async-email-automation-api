import { client, unwrap } from './client';

// POST /invoice  { customerId, items:[{productId, quantity}], dueDate, status?, paymentMethod?, notes? } -> 201 invoice
export const createInvoice = (body) => client.post('/invoice', body).then(unwrap);
// GET /invoice/:id -> invoice
export const getInvoice = (id) => client.get(`/invoice/${id}`).then(unwrap);
// PATCH /invoice/:id  (any subset of the create fields + termsAndConditions) -> updated invoice
export const updateInvoice = (id, body) => client.patch(`/invoice/${id}`, body).then(unwrap);
// DELETE /invoice/:id
export const deleteInvoice = (id) => client.delete(`/invoice/${id}`).then(unwrap);
// POST /invoice/:id/duplicate -> 200 new Draft invoice
export const duplicateInvoice = (id) => client.post(`/invoice/${id}/duplicate`).then(unwrap);
// POST /invoice/:id/email -> 202 { success, message, jobId }  (queued; emails the PDF to the invoice's customer)
export const emailInvoice = (id) => client.post(`/invoice/${id}/email`).then((r) => r.data);

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });

// Error bodies arrive as Blobs because responseType is 'blob'; turn them back into JSON for normalizeError.
async function parseBlobError(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try { error.response.data = JSON.parse(await data.text()); } catch { error.response.data = null; }
  }
  return error;
}

/**
 * GET /invoice/:id/pdf
 * The backend answers 200 + application/pdf when the PDF is already cached in Redis, otherwise 202 { jobId }
 * after queueing a worker job. No job-status route is mounted, so the same URL is polled until it returns 200.
 */
export async function downloadInvoicePdf(id, { signal, intervalMs = 1500, maxAttempts = 30, onQueued } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let response;
    try {
      response = await client.get(`/invoice/${id}/pdf`, { responseType: 'blob', signal });
    } catch (error) {
      throw await parseBlobError(error);
    }
    if (response.status === 200) return response.data;
    if (attempt === 0) onQueued?.();
    await wait(intervalMs, signal);
  }
  const error = new Error('PDF generation is taking longer than expected. Make sure the background worker is running, then try again.');
  error.code = 'PDF_TIMEOUT';
  throw error;
}
