import ApiError from "../utils/ApiError.js";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

export const csrfGuard = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();
  if (req.get("X-Requested-With") === "TrahoDoc") return next();
  next(ApiError.forbidden("Missing or invalid request header"));
};