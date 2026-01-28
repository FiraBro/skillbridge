import * as searchService from "./search.service.js";
import apiResponse from "../utils/apiResponse.js";

/**
 * GET /api/search
 * Global search
 */
export async function search(req, res, next) {
  try {
    const { q, type, skills, minRep } = req.query;
    const filters = {
      type: type || "all",
      skills: skills ? skills.split(",") : [],
      minReputation: minRep ? parseInt(minRep) : 0,
    };

    const results = await searchService.globalSearch(q || "", filters);
    return res.status(200).json(apiResponse.success(results));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/search/trending-skills
 */
export async function trendingSkills(req, res, next) {
  try {
    const skills = await searchService.getTrendingSkills();
    return res.status(200).json(apiResponse.success(skills));
  } catch (error) {
    next(error);
  }
}
