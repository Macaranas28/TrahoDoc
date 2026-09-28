import { Router } from "express";

import {
  createUser,
  getUsers,
  assignApplicationCoordinator,
  updateUserStatus,
} from "../controllers/user.controller.js";

import {
  createUserRules,
  listUsersRules,
  changeUserStatusRules,
} from "../validators/user.validators.js";

import { assignCoordinatorRules } from "../validators/coordinator.validators.js";
import { idParam } from "../validators/common.validators.js";

import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";

import { ROLES } from "../utils/constants.js";

const router = Router();

// Deny by default:
// Everything in this file is Admin-only.
router.use(authenticate, requireRole(ROLES.ADMIN));

// Get all users
router.get(
  "/",
  listUsersRules,
  validate,
  getUsers
);

// Create a new user
router.post(
  "/",
  createUserRules,
  validate,
  createUser
);

// Update user status
router.patch(
  "/:id/status",
  idParam,
  changeUserStatusRules,
  validate,
  updateUserStatus
);

// Assign application coordinator
router.patch(
  "/applications/:id/assign",
  idParam,
  assignCoordinatorRules,
  validate,
  assignApplicationCoordinator
);

export default router;