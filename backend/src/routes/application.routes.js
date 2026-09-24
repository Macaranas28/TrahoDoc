import { Router } from "express";
import {
  createApplication, listMine, getOne, submit, withdraw,
  listForEmployer, getOneForEmployer, employerRespond,
  listForCoordinator, getOneForCoordinator, changeStatus,
} from "../controllers/application.controller.js";
import { createApplicationRules, withdrawRules } from "../validators/application.validators.js";
import { employerResponseRules } from "../validators/employer.validators.js";
import { changeApplicationStatusRules } from "../validators/coordinator.validators.js";
import { idParam } from "../validators/common.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const studentOnly = requireRole(ROLES.STUDENT);
const employerOnly = requireRole(ROLES.EMPLOYER);
const coordinatorOnly = requireRole(ROLES.COORDINATOR);

router.use(authenticate);

router.post("/", studentOnly, createApplicationRules, validate, createApplication);
router.get("/mine", studentOnly, listMine); // fixed paths before wildcard ":id"

router.get("/", requireRole(ROLES.EMPLOYER, ROLES.COORDINATOR), (req, res, next) => {
  if (req.user.role === ROLES.EMPLOYER) return listForEmployer(req, res, next);
  return listForCoordinator(req, res, next);
});

router.get("/:id", requireRole(ROLES.STUDENT, ROLES.EMPLOYER, ROLES.COORDINATOR), idParam, validate, (req, res, next) => {
  if (req.user.role === ROLES.STUDENT) return getOne(req, res, next);
  if (req.user.role === ROLES.EMPLOYER) return getOneForEmployer(req, res, next);
  return getOneForCoordinator(req, res, next);
});

router.patch("/:id/submit", studentOnly, idParam, validate, submit);
router.patch("/:id/withdraw", studentOnly, idParam, withdrawRules, validate, withdraw);
router.patch("/:id/employer-response", employerOnly, idParam, employerResponseRules, validate, employerRespond);
router.patch("/:id/status", coordinatorOnly, idParam, changeApplicationStatusRules, validate, changeStatus);

export default router;