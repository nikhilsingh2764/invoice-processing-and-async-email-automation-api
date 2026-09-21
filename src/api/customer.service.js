import api from "./axios";

// ==========================
// Customer API Endpoints
// (Backend/src/route/invoice/customer.routes.js)
// ==========================

export const createCustomer = async (data) => {
    const response = await api.post("/customer", data);
    return response.data;
};

export const getCustomers = async () => {
    const response = await api.get("/customer");
    return response.data;
};

export const getCustomerById = async (id) => {
    const response = await api.get(`/customer/${id}`);
    return response.data;
};

export const updateCustomer = async (id, data) => {
    const response = await api.patch(`/customer/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id) => {
    const response = await api.delete(`/customer/${id}`);
    return response.data;
};
