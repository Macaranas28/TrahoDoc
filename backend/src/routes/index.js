import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import studentRoutes from "./student.routes.js";
import notificationRoutes from "./notification.routes.js";
import requirementRoutes from "./requirement.routes.js";
import employerRoutes from "./employer.routes.js";
import applicationRoutes from "./application.routes.js";
import documentRoutes from "./document.routes.js";
import auditLogRoutes from "./auditLog.routes.js";
// ...
router.use("/audit-logs", auditLogRoutes);

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/students", studentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/requirements", requirementRoutes);
router.use("/employers", employerRoutes);
router.use("/applications", applicationRoutes);
router.use("/documents", documentRoutes);

export default router;