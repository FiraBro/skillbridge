import axios from "axios";

/**
 * We use "/api" as the base.
 * - In Development: Vite proxy handles it.
 * - In Production: vercel.json rewrites handle it.
 * This prevents hardcoded URL mismatches and CORS headaches.
 */
const BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sb_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Flatten data and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // If your backend returns { data: ... }, this extracts it automatically
    return response.data;
  },
  (error) => {
    // Safety check for server crashes or network issues
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.statusText ||
      "Server Connection Error";

    console.error("[API Error Details]:", {
      status: error.response?.status,
      message: message,
      url: error.config?.url,
      // Logging the data helps catch validation errors (400 Bad Request)
      data: error.response?.data,
    });

    return Promise.reject({
      message,
      status: error.response?.status || 500,
    });
  },
);

export default apiClient;
