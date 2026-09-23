import { body } from "express-validator";
import { UPLOAD_RULES } from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";

export const uploadDocumentRules = [
  body("requirementId")
    .isString().withMessage("requirementId must be text").bail()
    .isMongoId().withMessage("Invalid requirement ID"),
  // applicationId is optional: students provide it, employers don't
  body("applicationId")
    .optional()
    .isString().withMessage("applicationId must be text").bail()
    .isMongoId().withMessage("Invalid application ID"),
];

// Runs after multer + express-validator. Checks the file itself exists and looks right.
export const requireValidFile = (req, res, next) => {
  if (!req.file) {
    return next(ApiError.badRequest("No file was uploaded. Use the 'file' field."));
  }
  if (!UPLOAD_RULES.ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return next(ApiError.badRequest("Only PDF, JPG, and PNG files are allowed"));
  }
  if (req.file.size === 0) {
    return next(ApiError.badRequest("The uploaded file is empty"));
  }
  next();
};