// admin.service.js
import * as repo from "./admin.repository.js";

export const getDashboardStats = async () => {
  const [users, posts, projects, jobs, reports] = await Promise.all([
    repo.countUsers(),
    repo.countPosts(),
    repo.countProjects(),
    repo.countJobs(),
    repo.countOpenReports(),
  ]);

  return {
    users,
    posts,
    projects,
    jobs,
    reports,
  };
};

export const getUsers = async (query) => {
  return repo.findUsers(query);
};

export const toggleSuspendUser = async (userId) => {
  return repo.toggleSuspend(userId);
};

export const getReports = async (query) => {
  return repo.getReports(query);
};

export const resolveReport = async (reportId) => {
  return repo.resolveReport(reportId);
};

export const getActivity = async (query) => {
  return repo.getActivity(query);
};

export const getSystemHealth = async () => {
  const db = await repo.checkDB();

  return {
    api: "healthy",
    database: db ? "connected" : "down",
    timestamp: new Date(),
  };
};
