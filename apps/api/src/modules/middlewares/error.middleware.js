import ApiError from "../utils/apiError.js";

// ----------------- DB Error Handlers -----------------
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ApiError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: "${value}". Please use another value.`;
  return new ApiError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ApiError(message, 400);
};

// ----------------- JWT Error Handlers -----------------
const handleJWTError = () =>
  new ApiError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new ApiError("Your token has expired. Please log in again.", 401);

// ----------------- Send Error (DEV) -----------------
const sendErrorDev = (err, res) => {
  const statusCode = Number(err.statusCode) || 500;

  res.status(statusCode).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// ----------------- Send Error (PROD) -----------------
const sendErrorProd = (err, res) => {
  const statusCode = Number(err.statusCode) || 500;

  if (err.isOperational) {
    res.status(statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("💥 ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// ----------------- Global Error Middleware -----------------
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = Number(err.statusCode) || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
