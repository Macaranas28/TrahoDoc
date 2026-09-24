import { Router } from "express";
import { createUser, getUsers } from "../controllers/user.controller.js";
import { createUserRules, listUsersRules } from "../validators/user.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";
import { assignApplicationCoordinator } from "../controllers/user.controller.js";
import { assignCoordinatorRules } from "../validators/coordinator.validators.js";
import { idParam } from "../validators/common.validators.js";

// add below the existing routes, still inside the Admin-only router:
router.patch("/applications/:id/assign", idParam, assignCoordinatorRules, validate, assignApplicationCoordinator);

const router = Router();

// Deny by default: everything in this file is Admin-only
router.use(authenticate, requireRole(ROLES.ADMIN));

router.get("/", listUsersRules, validate, getUsers);
router.post("/", createUserRules, validate, createUser);

export default router;