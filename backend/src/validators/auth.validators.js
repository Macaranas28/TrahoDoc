import { body } from "express-validator";
import { ROLES } from "../utils/constants.js";

// .isString() also blocks NoSQL injection such as {"$gt": ""}
export const nameRule = body("name")
  .isString().withMessage("Name must be text").bail()
  .trim()
  .isLength({ min: 2, max: 100 }).withMessage("Name must be 2 to 100 characters");

export const emailRule = body("email")
  .isString().withMessage("Email must be text").bail()
  .trim()
  .toLowerCase()
  .isLength({ max: 254 }).withMessage("Email is too long")
  .isEmail().withMessage("Enter a valid email address");

export const passwordRule = body("password")
  .isString().withMessage("Password must be text").bail()
  .isLength({ min: 8, max: 64 }).withMessage("Password must be 8 to 64 characters").bail()
  .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
  .withMessage("Password needs an uppercase letter, a lowercase letter, and a number");

export const registerRules = [
  nameRule,
  emailRule,
  passwordRule,
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
  // Admin and Coordinator accounts can never be self-registered
  body("role")
    .isString().withMessage("Role must be text").bail()
    .isIn([ROLES.STUDENT, ROLES.EMPLOYER]).withMessage("Role must be student or employer"),
];

export const loginRules = [
  emailRule,
  body("password")
    .isString().withMessage("Password is required").bail()
    .isLength({ min: 1, max: 128 }).withMessage("Password is required"),
];