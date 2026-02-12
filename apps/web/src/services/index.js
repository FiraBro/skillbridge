// src/api/index.js
import apiClient from "./api.client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* =========================
   JOBS
========================= */
export const jobService = {
  getAll: (params) => apiClient.get("/jobs", { params }),
  getRecommended: () => apiClient.get("/jobs/recommended"),
  getById: (id) => {
    if (!id) throw new Error("Job ID is required");
    return apiClient.get(`/jobs/${id}`);
  },
  create: (data) => apiClient.post("/jobs", data),
  apply: (id, data) => {
    if (!id) throw new Error("Job ID is required");
    return apiClient.post(`/jobs/${id}/apply`, data);
  },
  getCompanyJobs: () => {
    const res = apiClient.get("/jobs/company");
    console.log("res:", res);
    return res;
  },
  getApplicants: (jobId) => {
    if (!jobId) throw new Error("Job ID is required");
    const res = apiClient.get(`/jobs/${jobId}/applicants`);
    return res;
  },
  updateApplicationStatus: (applicationId, data) => {
    if (!applicationId) throw new Error("Application ID is required");
    return apiClient.patch(`/jobs/applications/${applicationId}`, data);
  },
};

/* =========================
   PROFILES & REPUTATION
========================= */
export const profileService = {
  getByUsername: (username) => apiClient.get(`/profiles/${username}`),
  getReputationBreakdown: (userId) =>
    apiClient.get(`/reputation/${userId}/breakdown`),
  getReputationHistory: (userId) =>
    apiClient.get(`/reputation/${userId}/history`),

  // Developer discovery API (role-based)
  discover: (params) => apiClient.get("/company/discovery", { params }),
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
   NOTIFICATIONS
========================= */
export const notificationService = {
  getNotifications: () => apiClient.get("/notifications"),
  sendRequest: (data) => apiClient.post("/notifications/contact", data),
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

export const companyService = {
  // --- Profile Management ---
  getProfile: () => apiClient.get("/company/profile"),

  updateProfile: (profileData) =>
    apiClient.post("/company/profile", profileData),

  // --- Talent Discovery ---
  // ✅ Use async/await to ensure the promise resolves correctly before returning
  discoverTalent: async (params) => {
    const response = await apiClient.get("/companies/discovery", { params });
    // This logs the actual data object returned by your backend apiResponse.success
    console.log("Discovery API response data:", response.data);
    return response.data;
  },

  // --- Bookmarks ---
  getBookmarks: () => apiClient.get("/company/bookmarks"),

  // Ensure these match your router: router.post("/bookmarks/:devId")
  // Since your router is mounted at /company, the path /company/bookmarks/:devId is correct.
  bookmarkDeveloper: (devId) => apiClient.post(`/company/bookmarks/${devId}`),

  removeBookmark: (devId) => apiClient.delete(`/company/bookmarks/${devId}`),

  // --- Applicant Management ---
  updateApplicationStatus: (appId, feedbackData) =>
    apiClient.patch(`/company/applications/${appId}/feedback`, feedbackData),
};
