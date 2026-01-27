import { createProjectSchema } from "./project.schema.js";
import { ProjectService } from "./project.service.js";
import logger from "../utils/logger.js";

export const createProject = async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const result = await ProjectService.createProject(data, req.user.id);
    logger.info("Project created", { userId: req.user.id });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Duplicate GitHub repo" });
    }
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const result = await ProjectService.updateProject(
      req.params.id,
      req.user.id,
      data,
    );
    logger.info("Project updated", { userId: req.user.id });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await ProjectService.deleteProject(
      req.params.id,
      req.user.id,
    );
    logger.info("Project deleted", { userId: req.user.id });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const result = await ProjectService.listProjects(req.query);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const result = await ProjectService.getProject(req.params.id);
    if (!result.rows.length)
      return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
