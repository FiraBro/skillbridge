import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
const generateResetToken = (userId) => {
  return jwt.sign({ sub: userId }, env.JWT_RESET_SECRET, {
    expiresIn: env.JWT_RESET_EXPIRES_IN,
  });
};
export default generateResetToken;
