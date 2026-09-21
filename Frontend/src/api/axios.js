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

        // If there is no response from server
        if (!error.response) {
            return Promise.reject(error);
        }

        // Don't try to refresh for these routes
        if (
            originalRequest.url.includes("/refresh-token") ||
            originalRequest.url.includes("/login") ||
            originalRequest.url.includes("/signup")
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

                // Retry original request
                return api(originalRequest);

            } catch (refreshError) {

                // Refresh token also expired

                localStorage.clear();

                window.location.href = "/login";

                return Promise.reject(refreshError);

            }

        }

        return Promise.reject(error);

    }

);

export default api;