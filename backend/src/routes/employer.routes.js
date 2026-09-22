import { Router } from "express";
import {
  getAccreditedEmployersList,
  getMyEmployerProfile,
  updateMyEmployerProfile,
  submitMyEmployerForReview,
} from "../controllers/employer.controller.js";
import { updateEmployerProfileRules } from "../validators/employer.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate); // every route below needs a login AND its own role guard

router.get("/accredited", requireRole(ROLES.STUDENT), getAccreditedEmployersList);

router.get("/me", requireRole(ROLES.EMPLOYER), getMyEmployerProfile);
router.put("/me", requireRole(ROLES.EMPLOYER), updateEmployerProfileRules, validate, updateMyEmployerProfile);
router.post("/me/submit", requireRole(ROLES.EMPLOYER), submitMyEmployerForReview);

export default router;