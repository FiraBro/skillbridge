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
  getCompanyJobs: () => apiClient.get("/jobs/company"),
  getApplicants: (jobId) => {
    if (!jobId) throw new Error("Job ID is required");
    return apiClient.get(`/jobs/${jobId}/applicants`);
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
  discover: (params) => apiClient.get("/developers/discover", { params }),
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

/* =========================
   REACT QUERY HOOK: DEVELOPER DISCOVERY
========================= */
export const useDeveloperDiscovery = ({ search, minReputation }) => {
  const queryClient = useQueryClient();

  const developersQuery = useQuery({
    queryKey: ["developers", search, minReputation],
    queryFn: () =>
      profileService
        .discover({ search, minReputation })
        .then((res) => res.data), // extract data from axios response
    keepPreviousData: true,
  });

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () =>
      apiClient
        .get("/companies/bookmarks")
        .then((res) => res.data.map((b) => b.id)),
  });

  const bookmarkMutation = useMutation({
    mutationFn: ({ devId, isBookmarked }) =>
      apiClient[isBookmarked ? "delete" : "post"](
        `/companies/bookmarks/${devId}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["bookmarks"]);
    },
  });

  return {
    developers: developersQuery.data || [],
    bookmarks: bookmarksQuery.data || [],
    isLoading: developersQuery.isLoading,
    toggleBookmark: bookmarkMutation.mutate,
  };
};
