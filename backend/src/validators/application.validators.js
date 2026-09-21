import { body } from "express-validator";

export const createApplicationRules = [
  body("employerId")
    .isString().withMessage("employerId must be text").bail()
    .isMongoId().withMessage("Invalid employer ID"),
];

export const withdrawRules = [
  body("remarks")
    .optional()
    .isString().withMessage("Remarks must be text").bail()
    .trim()
    .isLength({ max: 500 }).withMessage("Remarks must be at most 500 characters"),
];