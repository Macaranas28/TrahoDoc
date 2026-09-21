import { body } from "express-validator";
import { nameRule } from "./auth.validators.js";

export const updateProfileRules = [
  nameRule,
  body("phone")
    .isString().withMessage("Phone must be text").bail()
    .trim()
    .matches(/^[0-9+()\-\s]{7,20}$/).withMessage("Enter a valid phone number"),
  body("course")
    .isString().withMessage("Course must be text").bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Course must be 2 to 100 characters"),
  body("yearLevel")
    .isInt({ min: 1, max: 6 }).withMessage("Year level must be a whole number from 1 to 6")
    .toInt(),
];