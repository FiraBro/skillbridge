import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const generateAccessToken = (user) => {
  // We add 'username' and 'email' to the payload so the
  // frontend can access them after decoding the token.
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      username: user.username, // 👈 ADD THIS
      email: user.email, // 👈 ADD THIS
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  );
};

export default generateAccessToken;
