import apiClient from "./api.client";

export const jobService = {
  getAll: (params) => apiClient.get("/jobs", { params }),
  getRecommended: () => apiClient.get("/jobs/recommended"),
  getById: (id) => apiClient.get(`/jobs/${id}`),
  create: (data) => apiClient.post("/jobs", data),
  apply: (id, data) => apiClient.post(`/jobs/${id}/apply`, data),
  getCompanyJobs: () => apiClient.get("/jobs/company"), // Optional: filter by current user company
};

export const profileService = {
  getByUsername: (username) => apiClient.get(`/profiles/${username}`),
  getReputation: (userId) => apiClient.get(`/reputation/${userId}`),
  getHistory: (userId) => apiClient.get(`/reputation/${userId}/history`),
  discover: (params) => apiClient.get("/companies/discovery", { params }),
};

export const postService = {
  getAll: (params) => apiClient.get("/posts", { params }),
  getBySlug: (slug) => apiClient.get(`/posts/${slug}`),
  create: (data) => apiClient.post("/posts", data),
  like: (id) => apiClient.post(`/posts/${id}/like`),
  unlike: (id) => apiClient.delete(`/posts/${id}/like`),
  addComment: (id, text) => apiClient.post(`/posts/${id}/comments`, { text }),
  getComments: (id) => apiClient.get(`/posts/${id}/comments`),
  deleteComment: (id) => apiClient.delete(`/posts/${id}/comments`),
};

export const authService = {
  getCurrentUser: () => apiClient.get("/auth/me"),
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (data) => apiClient.post("/auth/register", data),
};
