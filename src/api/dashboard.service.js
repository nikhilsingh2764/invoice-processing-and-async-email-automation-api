import api from "./axios";

// ==========================
// Dashboard API Endpoint
// (Backend/src/route/dashboard/dashboard.routes.js)
//
// NOTE: This single endpoint is also how the "All invoices" list page
// gets its data — the backend does not expose a standalone GET /invoice
// list endpoint (only /invoice/:id for a single invoice). See the README
// "Known backend limitations" section.
//
// Supported query params (Backend/src/controller/dashboard/dashboard.controller.js):
// page, limit, search, paymentStatus, customerId, startDate, endDate,
// sortBy, sortOrder
// ==========================

export const getDashboard = async (params = {}) => {
    const response = await api.get("/dashboard", { params });
    return response.data;
};
