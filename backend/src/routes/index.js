import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// ---- TEMPORARY: role test routes (delete after Phase 8 testing) ----
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

for (const role of Object.values(ROLES)) {
  router.get(`/rbac-test/${role}`, authenticate, requireRole(role), (req, res) => {
    res.json({ success: true, message: `Welcome to the ${role} area` });
  });
}
// ---- END TEMPORARY ----

export default router;