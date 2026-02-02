import apiClient from "./api.client";

/* =========================
   JOBS
/* =========================
   JOBS (Updated)
========================= */
export const jobService = {
  getAll: (params) => apiClient.get("/jobs", { params }),
  getRecommended: () => apiClient.get("/jobs/recommended"),
  getById: (id) => apiClient.get(`/jobs/${id}`),
  create: (data) => apiClient.post("/jobs", data),
  apply: (id, data) => apiClient.post(`/jobs/${id}/apply`, data),
  getCompanyJobs: () => apiClient.get("/jobs/company"),
  getApplicants: (jobId) => apiClient.get(`/jobs/${jobId}/applicants`),
  // ADD THIS METHOD:
  updateApplicationStatus: (applicationId, data) =>
    apiClient.patch(`/jobs/applications/${applicationId}`, data),
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
   NOTIFICATIONS & INTERACTIONS
========================= */
export const notificationService = {
  /**
   * GET /api/notifications
   * Fetch all profile views and contact requests
   */
  getNotifications: () => apiClient.get("/notifications"),

  /**
   * POST /api/notifications/contact
   * Send a professional connection request
   * @param {Object} data - { receiverId: string, message: string }
   */
  sendRequest: (data) => apiClient.post("/notifications/contact", data),

  /**
   * PATCH /api/notifications/contact/:id
   * Accept or Ignore a pending contact request
   * @param {string} id - The request ID
   * @param {Object} data - { status: 'accepted' | 'ignored' }
   */
  respondToRequest: (id, data) =>
    apiClient.patch(`/notifications/contact/${id}`, data),
};
/* =========================
   AUTH
========================= */
export const authService = {
  getCurrentUser: () => apiClient.get("/auth/me"),
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (data) => apiClient.post("/auth/register", data),
};
