import multer from "multer";
import { UPLOAD_RULES } from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

export const uploadSingle = multer({
  storage,
  limits: { fileSize: UPLOAD_RULES.MAX_SIZE_BYTES, files: 1 },
}).single("file"); // the form field must be named "file"

// Multer's own errors (like "file too large") don't match our ApiError shape, so translate them
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(ApiError.badRequest(`File is too large. Maximum size is ${UPLOAD_RULES.MAX_SIZE_BYTES / (1024 * 1024)} MB`));
    }
    return next(ApiError.badRequest(`Upload error: ${err.message}`));
  }
  next(err);
};