import { Router } from "express";
import {
  getAccreditedEmployersList,
  getMyEmployerProfile,
  updateMyEmployerProfile,
  submitMyEmployerForReview,
  getEmployersForCoordinator,
  getEmployerDetail,
  decideEmployerAccreditation,
  reviewEmployerRiskFlag,
} from "../controllers/employer.controller.js";
import { updateEmployerProfileRules } from "../validators/employer.validators.js";
import { accreditationDecisionRules, riskFlagReviewRules } from "../validators/coordinator.validators.js";
import { idParam } from "../validators/common.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";
import { param } from "express-validator";

const router = Router();

router.use(authenticate); // every route below needs a login AND its own role guard

router.get("/accredited", requireRole(ROLES.STUDENT), getAccreditedEmployersList);

router.get("/me", requireRole(ROLES.EMPLOYER), getMyEmployerProfile);
router.put("/me", requireRole(ROLES.EMPLOYER), updateEmployerProfileRules, validate, updateMyEmployerProfile);
router.post("/me/submit", requireRole(ROLES.EMPLOYER), submitMyEmployerForReview);

const coordinatorOnly = requireRole(ROLES.COORDINATOR);
router.get("/", coordinatorOnly, getEmployersForCoordinator);
router.get("/:id", coordinatorOnly, idParam, validate, getEmployerDetail);
router.patch("/:id/accreditation", coordinatorOnly, idParam, accreditationDecisionRules, validate, decideEmployerAccreditation);
router.patch(
  "/:id/risk-flags/:flagId",
  coordinatorOnly,
  idParam,
  param("flagId").isMongoId().withMessage("Invalid flag ID"),
  riskFlagReviewRules,
  validate,
  reviewEmployerRiskFlag
);

export default router;