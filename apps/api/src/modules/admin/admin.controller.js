// admin.controller.js
import * as service from "./admin.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const data = await service.getDashboardStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await service.getUsers(req.query);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const toggleSuspendUser = async (req, res, next) => {
  try {
    const result = await service.toggleSuspendUser(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const data = await service.getReports(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const result = await service.resolveReport(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const activity = await service.getActivity(req.query);
    res.json(activity);
  } catch (err) {
    next(err);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const health = await service.getSystemHealth();
    res.json(health);
  } catch (err) {
    next(err);
  }
};
