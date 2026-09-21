import { Router } from "express";
import { createApplication, listMine, getOne, submit, withdraw } from "../controllers/application.controller.js";
import { createApplicationRules, withdrawRules } from "../validators/application.validators.js";
import { idParam } from "../validators/common.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();
const studentOnly = requireRole(ROLES.STUDENT);

router.use(authenticate); // every route below needs a login AND its own role guard

router.post("/", studentOnly, createApplicationRules, validate, createApplication);
router.get("/mine", studentOnly, listMine); // must stay above "/:id"
router.get("/:id", studentOnly, idParam, validate, getOne);
router.patch("/:id/submit", studentOnly, idParam, validate, submit);
router.patch("/:id/withdraw", studentOnly, idParam, withdrawRules, validate, withdraw);

export default router;