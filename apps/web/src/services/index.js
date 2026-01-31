import apiClient from "./api.client";

/* =========================
   JOBS
========================= */
export const jobService = {
  getAll: (params) => apiClient.get("/jobs", { params }),
  getRecommended: () => apiClient.get("/jobs/recommended"),
  getById: (id) => apiClient.get(`/jobs/${id}`),
  create: (data) => apiClient.post("/jobs", data),
  apply: (id, data) => apiClient.post(`/jobs/${id}/apply`, data),
  getCompanyJobs: () => apiClient.get("/jobs/company"),
};

/* =========================
   PROFILES & REPUTATION
========================= */
export const profileService = {
  // Profile
  getByUsername: (username) => apiClient.get(`/profiles/${username}`),

  // ✅ Reputation (FIXED — matches backend)
  getReputationBreakdown: (userId) =>
    apiClient.get(`/reputation/${userId}/breakdown`),

  getReputationHistory: (userId) =>
    apiClient.get(`/reputation/${userId}/history`),

  // Discovery
  discover: (params) => apiClient.get("/companies/discovery", { params }),
};

/* =========================
   POSTS
========================= */
export const postService = {
  getAll: (params) => apiClient.get("/posts", { params }),
  getBySlug: (slug) => apiClient.get(`/posts/${slug}`),
  create: (data) => apiClient.post("/posts", data),

  like: (id) => apiClient.post(`/posts/${id}/like`),
  unlike: (id) => apiClient.delete(`/posts/${id}/like`),

  addComment: (id, text) => apiClient.post(`/posts/${id}/comments`, { text }),

  getComments: (id) => apiClient.get(`/posts/${id}/comments`),

  deleteComment: (postId, commentId) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`),

  update: (id, data) => apiClient.patch(`/posts/${id}`, data),

  share: (id) => apiClient.post(`/posts/${id}/share`),
};

/* =========================
   AUTH
========================= */
export const authService = {
  getCurrentUser: () => apiClient.get("/auth/me"),
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (data) => apiClient.post("/auth/register", data),
};
