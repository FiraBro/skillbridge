import apiClient from "./api.client";

// Helper to keep code DRY (Don't Repeat Yourself)
// This ensures every service returns the exact same data structure
const extractData = (promise) => promise.then((res) => res.data || res);

/* =========================
   JOBS
========================= */
export const jobService = {
  getAll: (params) => extractData(apiClient.get("/jobs", { params })),
  getRecommended: () => extractData(apiClient.get("/jobs/recommended")),
  getById: (id) => extractData(apiClient.get(`/jobs/${id}`)),
  create: (data) => extractData(apiClient.post("/jobs", data)),
  apply: (id, data) => extractData(apiClient.post(`/jobs/${id}/apply`, data)),
  getCompanyJobs: () => extractData(apiClient.get("/jobs/company")),
  getApplicants: (jobId) =>
    extractData(apiClient.get(`/jobs/${jobId}/applicants`)),
  updateApplicationStatus: (applicationId, data) =>
    extractData(apiClient.patch(`/jobs/applications/${applicationId}`, data)),
};

/* =========================
   POSTS
========================= */
export const postService = {
  // Now consistently returns data, making your usePosts hook cleaner
  getAll: (params) => extractData(apiClient.get("/posts", { params })),

  getBySlug: (slug) => extractData(apiClient.get(`/posts/${slug}`)),

  create: (formData) =>
    extractData(
      apiClient.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    ),

  like: (id) => extractData(apiClient.post(`/posts/${id}/like`)),
  unlike: (id) => extractData(apiClient.delete(`/posts/${id}/like`)),

  toggleFollow: (authorId) =>
    extractData(apiClient.post(`/posts/${authorId}/follow`)),

  share: (id) => extractData(apiClient.post(`/posts/${id}/share`)),

  addComment: (id, text) =>
    extractData(apiClient.post(`/posts/${id}/comments`, { text })),
  getComments: (id) => extractData(apiClient.get(`/posts/${id}/comments`)),
  deleteComment: (postId, commentId) =>
    extractData(apiClient.delete(`/posts/${postId}/comments/${commentId}`)),

  update: (id, data) => extractData(apiClient.patch(`/posts/${id}`, data)),
  delete: (id) => extractData(apiClient.delete(`/posts/${id}`)),
};

/* =========================
   COMPANY & DISCOVERY
========================= */
export const companyService = {
  getProfile: () => extractData(apiClient.get("/company/profile")),
  updateProfile: (profileData) =>
    extractData(apiClient.post("/company/profile", profileData)),

  // Talent Discovery
  discoverTalent: (params) =>
    extractData(apiClient.get("/companies/discovery", { params })),

  // Bookmarks
  getBookmarks: () => extractData(apiClient.get("/company/bookmarks")),
  bookmarkDeveloper: (devId) =>
    extractData(apiClient.post(`/company/bookmarks/${devId}`)),
  removeBookmark: (devId) =>
    extractData(apiClient.delete(`/company/bookmarks/${devId}`)),

  updateApplicationStatus: (appId, feedbackData) =>
    extractData(
      apiClient.patch(`/company/applications/${appId}/feedback`, feedbackData),
    ),
};

/* =========================
   AUTH
========================= */
export const authService = {
  getCurrentUser: () => extractData(apiClient.get("/auth/me")),
  login: (credentials) =>
    extractData(apiClient.post("/auth/login", credentials)),
  register: (data) => extractData(apiClient.post("/auth/register", data)),
};

/* =========================
   NOTIFICATIONS & OTHERS
========================= */
export const notificationService = {
  getNotifications: () => extractData(apiClient.get("/notifications")),
  sendRequest: (data) =>
    extractData(apiClient.post("/notifications/contact", data)),
  respondToRequest: (id, data) =>
    extractData(apiClient.patch(`/notifications/contact/${id}`, data)),
};

export const profileService = {
  getByUsername: (username) =>
    extractData(apiClient.get(`/profiles/${username}`)),
  getReputationBreakdown: (userId) =>
    extractData(apiClient.get(`/reputation/${userId}/breakdown`)),
  getReputationHistory: (userId) =>
    extractData(apiClient.get(`/reputation/${userId}/history`)),
  discover: (params) =>
    extractData(apiClient.get("/company/discovery", { params })),
};
