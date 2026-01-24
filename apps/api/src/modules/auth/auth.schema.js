import ApiError from "../utils/apiError.js";
export const validateRegister = (body) => {
  const { email, password, confirmPassword } = body;

  if (!email || !email.includes("@")) {
    throw new ApiError(400, "Valid email is required");
  }

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }
};

export const validateLogin = (body) => {
  const { email, password } = body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
};
