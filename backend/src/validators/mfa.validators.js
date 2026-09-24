import { body } from "express-validator";

export const mfaCodeRules = [
  body("code")
    .isString().withMessage("Code must be text").bail()
    .trim().isLength({ min: 6, max: 10 }).withMessage("Enter a valid code"),
];

export const mfaLoginRules = [
  body("mfaToken").isString().withMessage("mfaToken is required"),
  body("code")
    .isString().withMessage("Code must be text").bail()
    .trim().isLength({ min: 6, max: 10 }).withMessage("Enter a valid code"),
];

export const disableMfaRules = [
  body("currentPassword")
    .isString().withMessage("Current password is required").bail()
    .isLength({ min: 1, max: 128 }).withMessage("Current password is required"),
];