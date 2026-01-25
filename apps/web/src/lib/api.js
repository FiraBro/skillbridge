// apps/web/src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data),
  getGithubAuth: () =>
    (window.location.href = `${api.defaults.baseURL}/auth/github`),
};
