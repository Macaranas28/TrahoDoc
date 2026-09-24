import { Router } from "express";
import { getAuditLogs, getAuditLogOptions } from "../controllers/auditLog.controller.js";
import { listAuditLogsRules } from "../validators/auditLog.validators.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

// Deny by default: everything here is Admin-only, and there is intentionally
// no write route in this file — audit logs are read-only, permanently.
router.use(authenticate, requireRole(ROLES.ADMIN));

router.get("/", listAuditLogsRules, validate, getAuditLogs);
router.get("/actions", getAuditLogOptions);

export default router;