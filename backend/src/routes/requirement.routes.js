import { Router } from "express";
import { getRequirements } from "../controllers/requirement.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// Read-only for every logged-in role. Coordinators get write access in a later phase.
router.get("/", authenticate, getRequirements);

export default router;