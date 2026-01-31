// apps/web/src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URLs || "/api",
  withCredentials: true, // This ensures cookies are sent with requests
});

// Request interceptor to add auth token to headers as well
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sb_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (data) => {
    console.log("authApi.login called with:", data);
    const res = await api.post("/auth/login", data);
    console.log("authApi.login response:", res.data);
    return res;
  },
  register: (data) => api.post("/auth/register", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),
  // For GitHub auth, we'll handle it differently to ensure redirect works properly
};

// Function to initiate GitHub OAuth flow with proper authentication
// Now that we store the token in cookies too, the backend can authenticate via cookies
export const initiateGithubAuth = () => {
  // Since we store the token in cookies (via useAuth hook),
  // and the axios instance has withCredentials=true,
  // the cookie will be sent automatically with the redirect
  window.location.href = `${import.meta.env.VITE_API_URL || "/api"}/github/auth/github`;
};
