import { Router } from "express";
import {
  createApplication, listMine, getOne, submit, withdraw,
  listForEmployer, getOneForEmployer, employerRespond,
} from "../controllers/application.controller.js";
import { createApplicationRules, withdrawRules } from "../validators/application.validators.js";
import { employerResponseRules } from "../validators/employer.validators.js";
import { idParam } from "../validators/common.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const studentOnly = requireRole(ROLES.STUDENT);
const employerOnly = requireRole(ROLES.EMPLOYER);

router.use(authenticate); // every route below needs a login AND its own role guard

// Student routes
router.post("/", studentOnly, createApplicationRules, validate, createApplication);
router.get("/mine", studentOnly, listMine); // must stay above "/:id"

// Employer routes
router.get("/", employerOnly, listForEmployer); // GET /api/applications (employer's own list)

router.get("/:id", requireRole(ROLES.STUDENT, ROLES.EMPLOYER), idParam, validate, async (req, res, next) => {
  // one URL, two possible viewers: dispatch by role, each with its own ownership check
  if (req.user.role === ROLES.STUDENT) return getOne(req, res, next);
  return getOneForEmployer(req, res, next);
});

router.patch("/:id/submit", studentOnly, idParam, validate, submit);
router.patch("/:id/withdraw", studentOnly, idParam, withdrawRules, validate, withdraw);
router.patch("/:id/employer-response", employerOnly, idParam, employerResponseRules, validate, employerRespond);

export default router;