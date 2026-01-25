import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
const generateAccessToken = (user) => {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};
export default generateAccessToken;
