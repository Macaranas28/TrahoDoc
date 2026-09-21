import { body, query } from "express-validator";
import { ROLES } from "../utils/constants.js";
import { nameRule, emailRule, passwordRule } from "./auth.validators.js";

export const createUserRules = [
  nameRule,
  emailRule,
  passwordRule,
  body("role")
    .isString().withMessage("Role must be text").bail()
    .isIn([ROLES.COORDINATOR, ROLES.ADMIN]).withMessage("Role must be coordinator or admin"),
];

export const listUsersRules = [
  query("role")
    .optional()
    .isString().withMessage("Role must be text").bail()
    .isIn(Object.values(ROLES)).withMessage("Unknown role"),
  query("page").optional().isInt({ min: 1, max: 10000 }).withMessage("page must be a positive whole number"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];