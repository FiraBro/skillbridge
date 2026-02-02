// api.client.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // This is the safety check:
    // If the server crashes, error.response.data might be undefined
    const message =
      error.response?.data?.message ||
      error.response?.statusText ||
      "Server Connection Error";

    console.error("[API Error Details]:", {
      status: error.response?.status,
      message: message,
      url: error.config?.url,
    });

    return Promise.reject({
      message,
      status: error.response?.status || 500,
    });
  },
);

export default apiClient;
