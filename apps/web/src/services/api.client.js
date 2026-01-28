import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || "An unexpected error occurred";
    // We could trigger global toasts here if needed
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
