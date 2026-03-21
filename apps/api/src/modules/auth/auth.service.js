import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../../config/db.js";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";
import generateResetToken from "../utils/token.js";
import generateAccessToken from "../utils/accessToken.js";
import { generateUniqueUsername } from "../utils/slug.js";
import * as profileService from "../profile/profile.service.js";

export const register = async ({
  email,
  password,
  name,
  role = "developer",
}) => {
  const existing = await query("SELECT id FROM users WHERE email=$1", [email]);

  if (existing.rowCount > 0) {
    throw new ApiError(409, "Email already registered");
  }

  const username = await generateUniqueUsername(name);

  const saltRounds = parseInt(env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await query(
    `
    INSERT INTO users(email, password_hash, name, role, username)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, name, role, username, created_at
    `,
    [email, passwordHash, name, role, username],
  );

  const user = result.rows[0];

  await profileService.createProfile({
    userId: user.id,
    username: user.username,
    fullName: name,
  });

  const token = generateAccessToken(user);

  return {
    user,
    token,
  };
};

export const login = async ({ email, password }) => {
  const result = await query(
    `SELECT u.*, p.username 
     FROM users u 
     LEFT JOIN profiles p ON p.user_id = u.id 
     WHERE u.email=$1`,
    [email],
  );

  const user = result.rows[0];

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateAccessToken(user);

  delete user.password_hash;
  delete user.password_reset_token;

  return { user, token };
};

export const forgotPassword = async (email) => {
  const result = await query("SELECT id, name FROM users WHERE email=$1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user) {
    return {
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
  }

  const resetToken = generateResetToken(user.id);
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  try {
    await query("BEGIN");

    await query(
      `
      UPDATE users
      SET password_reset_token=$1,
          password_reset_expires=$2
      WHERE id=$3
      `,
      [resetToken, expires, user.id],
    );

    // BACKGROUND JOB REMOVED: Email will no longer be queued here.
    // You may want to call a direct email send function here instead.

    await query("COMMIT");

    return { success: true };
  } catch (error) {
    await query("ROLLBACK");
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  let payload;

  try {
    payload = jwt.verify(token, env.JWT_RESET_SECRET);
  } catch (error) {
    throw new ApiError(400, "Invalid or expired token");
  }

  try {
    await query("BEGIN");

    const result = await query(
      `
      SELECT id, password_reset_expires 
      FROM users 
      WHERE id = $1 AND password_reset_token = $2
      FOR UPDATE
      `,
      [payload.sub, token],
    );

    const user = result.rows[0];

    if (!user || new Date(user.password_reset_expires) < new Date()) {
      await query("ROLLBACK");
      throw new ApiError(400, "Invalid or expired token");
    }

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

    await query(
      `
      UPDATE users 
      SET password_hash = $1, 
          password_reset_token = NULL, 
          password_reset_expires = NULL 
      WHERE id = $2
      `,
      [passwordHash, user.id],
    );

    await query("COMMIT");
  } catch (error) {
    await query("ROLLBACK");
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Internal server error during password reset");
  }
};

export const handleGithubAuth = async (githubUser) => {
  const result = await query(
    `INSERT INTO users (github_id, github_username, email, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (github_id) DO UPDATE 
     SET github_username = EXCLUDED.github_username, avatar_url = EXCLUDED.avatar_url
     RETURNING id, role, onboarding_completed`,
    [githubUser.id, githubUser.login, githubUser.email, githubUser.avatar_url],
  );

  const user = result.rows[0];

  const { rowCount: profileExists } = await query(
    "SELECT 1 FROM profiles WHERE user_id = $1",
    [user.id],
  );

  if (profileExists === 0) {
    const username = await generateUniqueUsername(githubUser.login);
    await profileService.createProfile({
      userId: user.id,
      username,
      fullName: githubUser.name || githubUser.login,
      githubUsername: githubUser.login,
    });
  }

  // BACKGROUND JOB REMOVED: GitHub stats will no longer be synced here.

  const token = generateAccessToken(user);

  return { user, token };
};

export const fetchUser = async () => {
  const result = await query("SELECT * FROM users");
  return result;
};

export const deleteUser = async (userId) => {
  await query("DELETE FROM users WHERE id = $1", [userId]);
};
