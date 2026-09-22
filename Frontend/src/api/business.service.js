import api from "./axios";

// ==========================
// Business Profile API Endpoints
// (Backend/src/route/invoice/business.routes.js)
// ==========================

export const createBusiness = async (data) => {
    const response = await api.post("/business", data);
    return response.data;
};

export const getBusiness = async () => {
    const response = await api.get("/business");
    return response.data;
};

export const updateBusiness = async (data) => {
    const response = await api.patch("/business", data);
    return response.data;
};

export const deleteBusiness = async () => {
    const response = await api.delete("/business");
    return response.data;
};
