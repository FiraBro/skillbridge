import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../config/db.js";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";
import { emailQueue } from "../../queues/email.queue.js"; // You'll create this next
import { githubQueue } from "../../queues/github.queue.js";
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

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const result = await query(
    `
    INSERT INTO users(email, password_hash, name, role)
    VALUES ($1,$2,$3,$4)
    RETURNING id, email, name, role, created_at
    `,
    [email, passwordHash, name, role],
  );

  const user = result.rows[0];

  // ⚡ Auto-create Profile
  const username = await generateUniqueUsername(name);
  await profileService.createProfile({
    userId: user.id,
    username,
    fullName: name,
  });

  const token = generateAccessToken(user);

  return { user: { ...user, username }, token };
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

// apps/api/src/modules/auth/auth.service.js

export const forgotPassword = async (email) => {
  // 1. Check if user exists
  const result = await query("SELECT id, name FROM users WHERE email=$1", [
    email,
  ]);
  const user = result.rows[0];

  // Real-world security: Always return success to prevent "Email Enumeration" attacks
  if (!user) {
    return {
      success: true,
      message: "If an account exists, a reset link has been sent.",
    };
  }

  const resetToken = generateResetToken(user.id);
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes

  // 2. Use a Transaction to update the DB
  try {
    await query("BEGIN"); // Start transaction

    await query(
      `
      UPDATE users
      SET password_reset_token=$1,
          password_reset_expires=$2
      WHERE id=$3
      `,
      [resetToken, expires, user.id],
    );

    // 3. Push the email task to the Background Queue
    // We pass the name and email so the worker has everything it needs
    await emailQueue.add(
      "send-reset-email",
      {
        email: email,
        name: user.name,
        token: resetToken,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      },
      {
        attempts: 3, // Retry 3 times if email service fails
        backoff: 1000, // Wait 1 second before retrying
      },
    );

    await query("COMMIT"); // Save changes

    return { success: true };
  } catch (error) {
    await query("ROLLBACK"); // Cancel changes if something fails
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  let payload;

  // 1. Verify the JWT Token first (Before opening a DB connection)
  try {
    payload = jwt.verify(token, env.JWT_RESET_SECRET);
  } catch (error) {
    throw new ApiError(400, "Invalid or expired token");
  }

  // 2. Start the Transaction block
  try {
    await query("BEGIN");

    // 3. Find user and lock the row (FOR UPDATE)
    // This prevents "Race Conditions" if the user clicks twice
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

    // 4. Validate user existence and token expiration
    if (!user || new Date(user.password_reset_expires) < new Date()) {
      // If invalid, we must rollback before throwing the error
      await query("ROLLBACK");
      throw new ApiError(400, "Invalid or expired token");
    }

    // 5. Hash the new password (CPU intensive task)
    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

    // 6. Update user security credentials and clear reset fields
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

    // 7. Success: Commit changes to permanent storage
    await query("COMMIT");
  } catch (error) {
    // 8. Failure: Rollback ensures no "partial updates" occur
    // If the DB crashes or code fails, the reset token remains unchanged
    await query("ROLLBACK");

    // Re-throw the error so the controller can handle the response
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, "Internal server error during password reset");
  }
};

export const handleGithubAuth = async (githubUser) => {
  // 1. Save or Update user in DB
  const result = await query(
    `INSERT INTO users (github_id, github_username, email, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (github_id) DO UPDATE 
     SET github_username = EXCLUDED.github_username, avatar_url = EXCLUDED.avatar_url
     RETURNING id, role, onboarding_completed`,
    [githubUser.id, githubUser.login, githubUser.email, githubUser.avatar_url],
  );

  const user = result.rows[0];

  // ⚡ Ensure Profile exists for GitHub users
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

  // 2. Trigger background sync for credibility anchor
  await githubQueue.add("sync-developer-stats", {
    userId: user.id,
    githubUsername: githubUser.login,
    accessToken: githubUser.token,
  });

  // 3. Generate the session token
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
