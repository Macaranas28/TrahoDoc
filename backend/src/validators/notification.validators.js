import { query } from "express-validator";
import { paginationRules } from "./common.validators.js";

export const listNotificationsRules = [
  ...paginationRules,
  query("unread").optional().isIn(["true", "false"]).withMessage("unread must be true or false"),
];