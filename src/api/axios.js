import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 60000,
});

// ==============================
// Response Interceptor
// ==============================

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        // No response from server
        if (!error.response) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest?.url || "";

        // Never refresh these requests
        if (
            requestUrl.includes("/refresh-token") ||
            requestUrl.includes("/login") ||
            requestUrl.includes("/signup")
        ) {
            return Promise.reject(error);
        }

        // Access token expired
        if (
            error.response.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            try {

                // Get new access token
                await api.post("/refresh-token");

                // Retry original request ONCE
                return api(originalRequest);

            } catch (refreshError) {

                // Refresh failed → stop retrying
                localStorage.clear();

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }

);

export default api;