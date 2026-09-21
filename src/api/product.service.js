import api from "./axios";

// ==========================
// Product API Endpoints
// (Backend/src/route/invoice/product.routes.js)
// ==========================

export const createProduct = async (data) => {
    const response = await api.post("/product", data);
    return response.data;
};

export const getProducts = async () => {
    const response = await api.get("/product");
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
};

export const updateProduct = async (id, data) => {
    const response = await api.patch(`/product/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
};
