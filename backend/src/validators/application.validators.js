import { EMPLOYER_RESPONSE } from "../utils/constants.js"; // add to the existing top import line instead — see note below
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

export const employerResponseValidationRules = [
  // duplicated on purpose: kept local so application.validators.js has no dependency on employer.validators.js
];