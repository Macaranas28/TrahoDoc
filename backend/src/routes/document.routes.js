import { Router } from "express";
import { getMyDocuments } from "../controllers/document.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate); // every route below needs a login AND its own role guard

router.get("/mine", requireRole(ROLES.STUDENT), getMyDocuments);

export default router;