import axiosInstance from "../api/axios";

let isRefreshing = false;

let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then(() => axiosInstance(originalRequest));
    }

    originalRequest._retry = true;

    isRefreshing = true;

    try {
      await axiosInstance.post("/auth/refresh-token");

      processQueue(null);

      return axiosInstance(originalRequest);
    } catch (err) {
      processQueue(err);

      window.location.href = "/login";

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);