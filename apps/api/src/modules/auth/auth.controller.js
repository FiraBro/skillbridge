import * as authService from "./auth.service.js";
import { validateRegister, validateLogin } from "./auth.schema.js";
import { success } from "../utils/apiResponse.js";
import { exchangeCodeForGithubUser } from "../services/github.external.js";
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

// apps/api/src/modules/auth/auth.controller.js

export const githubCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    // 1. Call external API service to get GitHub data
    const githubUser = await exchangeCodeForGithubUser(code);

    // 2. Call our Business Logic Service
    const { user, token } = await authService.handleGithubAuth(githubUser);

    // 3. Handle the HTTP Response (Redirect to Frontend)
    // If onboarding is not done, we could append a flag here
    const redirectUrl = user.onboarding_completed
      ? `${process.env.FRONTEND_URL}/dashboard`
      : `${process.env.FRONTEND_URL}/onboarding`;

    res.redirect(`${redirectUrl}?token=${token}`);
  } catch (error) {
    next(error); // Pass to error.middleware.js
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in req.user
    await authService.deleteUser(userId);
    res.json(success(null, "User account deleted successfully"));
  } catch (err) {
    next(err);
  }
};
