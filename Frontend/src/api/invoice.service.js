import api from "./axios";

// ==========================
// Invoice API Endpoints
// (Backend/src/route/invoice/invoice.routes.js)
// ==========================

export const createInvoice = async (data) => {
    const response = await api.post("/invoice", data);
    return response.data;
};

export const getInvoiceById = async (id) => {
    const response = await api.get(`/invoice/${id}`);
    return response.data;
};

export const updateInvoice = async (id, data) => {
    const response = await api.patch(`/invoice/${id}`, data);
    return response.data;
};

export const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoice/${id}`);
    return response.data;
};

// PDF generation is async on the backend: the first call may return a
// binary PDF (200, cache hit) OR a 202 with { jobId } while the worker
// generates it. There is no job-status endpoint exposed by the backend,
// so callers should retry this same call after a short delay to pick up
// the now-cached PDF. See invoice.service's `downloadInvoicePDF` usage
// inside hooks/useInvoices.js for the retry loop.
export const downloadInvoicePDF = async (id) => {
    const response = await api.get(`/invoice/${id}/pdf`, {
        responseType: "arraybuffer",
        // Accept both a PDF body and a 202 JSON "still processing" body.
        validateStatus: (status) => status === 200 || status === 202,
    });

    const contentType = response.headers?.["content-type"] || "";

    if (response.status === 202 || contentType.includes("application/json")) {

        const json = JSON.parse(
            new TextDecoder().decode(response.data)
        );

        return { queued: true, jobId: json.jobId };
    }

    return { queued: false, blob: new Blob([response.data], { type: "application/pdf" }) };
};

// The backend queues this and immediately returns 202 + jobId. It does
// not confirm actual delivery — see README "Known backend limitations".
export const sendInvoiceEmail = async (id) => {
    const response = await api.post(`/invoice/${id}/email`);
    return response.data;
};

export const duplicateInvoice = async (id) => {
    const response = await api.post(`/invoice/${id}/duplicate`);
    return response.data;
};
