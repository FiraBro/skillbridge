import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../../config/db.js";
import { env } from "../../config/env.js";
import ApiError from "../utils/apiError.js";
const generateAccessToken = (user) => {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

const generateResetToken = (userId) => {
  return jwt.sign({ sub: userId }, env.JWT_RESET_SECRET, {
    expiresIn: env.JWT_RESET_EXPIRES_IN,
  });
};

export const register = async ({ email, password, name }) => {
  const existing = await query("SELECT id FROM users WHERE email=$1", [email]);

  if (existing.rowCount > 0) {
    throw new ApiError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const result = await query(
    `
    INSERT INTO users(email, password_hash, name)
    VALUES ($1,$2,$3)
    RETURNING id, email, name, role, created_at
    `,
    [email, passwordHash, name],
  );

  const user = result.rows[0];
  const token = generateAccessToken(user);

  return { user, token };
};

export const login = async ({ email, password }) => {
  const result = await query("SELECT * FROM users WHERE email=$1", [email]);

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
  const result = await query("SELECT id FROM users WHERE email=$1", [email]);

  const user = result.rows[0];
  if (!user) {
    return; // silent success
  }

  const resetToken = generateResetToken(user.id);
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await query(
    `
    UPDATE users
    SET password_reset_token=$1,
        password_reset_expires=$2
    WHERE id=$3
    `,
    [resetToken, expires, user.id],
  );

  // TODO: send email here
  console.log("Reset Token:", resetToken);
};

export const resetPassword = async (token, newPassword) => {
  let payload;

  try {
    payload = jwt.verify(token, env.JWT_RESET_SECRET);
  } catch {
    throw new ApiError(400, "Invalid or expired token");
  }

  const result = await query(
    `
    SELECT id, password_reset_expires
    FROM users
    WHERE id=$1 AND password_reset_token=$2
    `,
    [payload.sub, token],
  );

  const user = result.rows[0];

  if (!user || new Date(user.password_reset_expires) < new Date()) {
    throw new ApiError(400, "Invalid or expired token");
  }

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

  await query(
    `
    UPDATE users
    SET password_hash=$1,
        password_reset_token=NULL,
        password_reset_expires=NULL
    WHERE id=$2
    `,
    [passwordHash, user.id],
  );
};
