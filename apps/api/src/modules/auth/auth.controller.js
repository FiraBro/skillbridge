import * as authService from "./auth.service.js";
import { validateRegister, validateLogin } from "./auth.schema.js";
import { success } from "../utils/apiResponse.js";
export const register = async (req, res, next) => {
  try {
    validateRegister(req.body);
    const result = await authService.register(req.body);
    res.status(201).json(success(result, "User registered"));
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    validateLogin(req.body);
    const result = await authService.login(req.body);
    res.json(success(result, "Login successful"));
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json(success(null, "If email exists, reset link sent"));
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json(success(null, "Password reset successful"));
  } catch (err) {
    next(err);
  }
};
