// admin.validation.js

export const validatePagination = (req, res, next) => {
  req.query.page = Number(req.query.page) || 1;
  req.query.limit = Math.min(Number(req.query.limit) || 20, 100);
  next();
};

export const validateUserQuery = (req, res, next) => {
  const { role } = req.query;

  if (role && !["developer", "company"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  next();
};
