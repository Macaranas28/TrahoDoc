import { param, query } from "express-validator";

export const idParam = param("id").isMongoId().withMessage("Invalid ID");

export const paginationRules = [
  query("page").optional().isInt({ min: 1, max: 10000 }).withMessage("page must be a positive whole number"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];