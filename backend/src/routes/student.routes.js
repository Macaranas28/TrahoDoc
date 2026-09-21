import { Router } from "express";
import { getMyProfile, updateMyProfile } from "../controllers/student.controller.js";
import { updateProfileRules } from "../validators/student.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

// Deny by default: everything in this file is Student-only
router.use(authenticate, requireRole(ROLES.STUDENT));

router.get("/me", getMyProfile);
router.put("/me", updateProfileRules, validate, updateMyProfile);

export default router;