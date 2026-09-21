import ApiError from "../utils/ApiError.js";

// Runs when no route matched
export const notFound = (req, res, next) => {
  next(new ApiError(404, "Route not found"));
};

// Runs whenever any code throws an error
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let details = err.details;

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON format";
  } else if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  } else if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "This value already exists";
  }

  // Unexpected errors: log the real problem, tell the user nothing sensitive
  if (statusCode >= 500) {
    console.error(err);
    message = "Something went wrong";
    details = undefined;
  }

  const body = { success: false, message };
  if (details) body.details = details;
  res.status(statusCode).json(body);
};