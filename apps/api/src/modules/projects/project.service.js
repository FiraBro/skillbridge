import { ProjectModel } from "./project.schema.js";
import { redis } from "../../config/redis.js";
import { fetchRepoStars } from "../utils/github.js";
import { sanitizeMarkdown } from "../utils/sanitize.js";

export const ProjectService = {
  async createProject(data, userId) {
    // Fire-and-forget GitHub call
    fetchRepoStars(data.githubRepo)
      .then((stars) => {
        if (stars !== null) {
          // For MVP: just log or cache
          console.log(`Repo stars for ${data.githubRepo}:`, stars);

          // Later: persist via background job
          // ProjectModel.updateStars(projectId, stars)
        }
      })
      .catch(() => {}); // never crash project creation

    // Sanitize markdown description
    const descriptionHtml = sanitizeMarkdown(data.description);

    // Always create project immediately
    return ProjectModel.create({
      ...data,
      userId,
      descriptionHtml,
    });
  },

  async listProjects(query) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 20), 50);
    const offset = (page - 1) * limit;

    return ProjectModel.findPublic({
      tech: query.tech,
      limit,
      offset,
    });
  },

  async getProject(id) {
    const redisKey = `project:${id}:views`;
    redis.incr(redisKey); // async, non-blocking
    return ProjectModel.findById(id);
  },
  async updateProject(id, userId, data) {
    const descriptionHtml = sanitizeMarkdown(data.description);
    return ProjectModel.update(id, userId, { ...data, descriptionHtml });
  },
  async deleteProject(id, userId) {
    return ProjectModel.delete(id, userId);
  },
};
