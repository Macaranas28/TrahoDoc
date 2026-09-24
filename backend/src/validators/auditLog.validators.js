import { query } from "express-validator";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";
import { paginationRules } from "./common.validators.js";

export const listAuditLogsRules = [
  ...paginationRules,
  query("action").optional().isIn(Object.values(AUDIT_ACTIONS)).withMessage("Unknown action"),
  query("module").optional().isIn(Object.values(AUDIT_MODULES)).withMessage("Unknown module"),
  query("result").optional().isIn(["success", "failure"]).withMessage("result must be success or failure"),
  query("userId").optional().isMongoId().withMessage("Invalid user ID"),
  query("from").optional().isISO8601().withMessage("from must be a valid date"),
  query("to").optional().isISO8601().withMessage("to must be a valid date"),
];