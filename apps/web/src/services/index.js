import apiClient from "./api.client";

// Helper to keep code DRY (Don't Repeat Yourself)
// This ensures every service returns the exact same data structure
const extractData = (promise) => promise.then((res) => res.data || res);

/* =========================
   JOBS
========================= */
export const jobService = {
  getAll: (params) => {
    const res = extractData(apiClient.get("/api/jobs", { params }));
    console.log("Fetched Jobs:", res);
    return res;
  },
  getRecommended: () => extractData(apiClient.get("/api/jobs/recommended")),
  getById: (id) => extractData(apiClient.get(`/api/jobs/${id}`)),
  create: (data) => extractData(apiClient.post("/api/jobs", data)),
  apply: (id, data) =>
    extractData(apiClient.post(`/api/jobs/${id}/apply`, data)),
  getCompanyJobs: () => extractData(apiClient.get("/api/jobs/company")),
  getApplicants: (jobId) =>
    extractData(apiClient.get(`/api/jobs/${jobId}/applicants`)),
  updateApplicationStatus: (applicationId, data) =>
    extractData(
      apiClient.patch(`/api/jobs/applications/${applicationId}`, data),
    ),
};

/* =========================
   POSTS
========================= */
export const postService = {
  // Now consistently returns data, making your usePosts hook cleaner
  getAll: (params) => extractData(apiClient.get("/api/posts", { params })),

  getBySlug: (slug) => extractData(apiClient.get(`/api/posts/${slug}`)),

  create: (formData) =>
    extractData(
      apiClient.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    ),

  like: (id) => extractData(apiClient.post(`/api/posts/${id}/like`)),
  unlike: (id) => extractData(apiClient.delete(`/api/posts/${id}/like`)),

  toggleFollow: (authorId) =>
    extractData(apiClient.post(`/api/posts/${authorId}/follow`)),

  share: (id) => extractData(apiClient.post(`/api/posts/${id}/share`)),

  addComment: (id, text) =>
    extractData(apiClient.post(`/api/posts/${id}/comments`, { text })),
  getComments: (id) => extractData(apiClient.get(`/api/posts/${id}/comments`)),
  deleteComment: (postId, commentId) =>
    extractData(apiClient.delete(`/api/posts/${postId}/comments/${commentId}`)),

  update: (id, data) => extractData(apiClient.patch(`/api/posts/${id}`, data)),
  delete: (id) => extractData(apiClient.delete(`/api/posts/${id}`)),
};

/* =========================
   COMPANY & DISCOVERY
========================= */
export const companyService = {
  getProfile: () => extractData(apiClient.get("/api/company/profile")),
  updateProfile: (profileData) =>
    extractData(apiClient.post("/api/company/profile", profileData)),

  // Talent Discovery
  discoverTalent: (params) =>
    extractData(apiClient.get("/api/companies/discovery", { params })),
  // Bookmarks
  getBookmarks: () => extractData(apiClient.get("/api/company/bookmarks")),
  bookmarkDeveloper: (devId) =>
    extractData(apiClient.post(`/api/company/bookmarks/${devId}`)),
  removeBookmark: (devId) =>
    extractData(apiClient.delete(`/api/company/bookmarks/${devId}`)),

  updateApplicationStatus: (appId, feedbackData) =>
    extractData(
      apiClient.patch(
        `/api/company/applications/${appId}/feedback`,
        feedbackData,
      ),
    ),
};

/* =========================
   AUTH
========================= */
export const authService = {
  getCurrentUser: () => extractData(apiClient.get("/api/auth/me")),
  login: (credentials) =>
    extractData(apiClient.post("/api/auth/login", credentials)),
  register: (data) => extractData(apiClient.post("/api/auth/register", data)),
};

/* =========================
   NOTIFICATIONS & OTHERS
========================= */
export const notificationService = {
  getNotifications: () => extractData(apiClient.get("/api/notifications")),
  sendRequest: (data) =>
    extractData(apiClient.post("/api/notifications/contact", data)),
  respondToRequest: (id, data) =>
    extractData(apiClient.patch(`/api/notifications/contact/${id}`, data)),
};

export const profileService = {
  getByUsername: (username) =>
    extractData(apiClient.get(`/api/profiles/${username}`)),
  getReputationBreakdown: (userId) =>
    extractData(apiClient.get(`/api/reputation/${userId}/breakdown`)),
  getReputationHistory: (userId) => {
    const res = extractData(apiClient.get(`/api/reputation/${userId}/history`));
    return res;
  },
  discover: (params) =>
    extractData(apiClient.get("/api/company/discovery", { params })),
};
