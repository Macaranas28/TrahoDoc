import ApiError from "../utils/ApiError.js";
import { logAction } from "../services/audit.service.js";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";

// Usage: router.get("/x", authenticate, requireRole(ROLES.ADMIN), handler)
export const requireRole = (...allowedRoles) => {
  if (allowedRoles.length === 0) {
    throw new Error("requireRole needs at least one role"); // fail loudly, never allow everyone
  }

  return async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized(); // authenticate must run first

    if (!allowedRoles.includes(req.user.role)) {
      await logAction({
        req,
        userId: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.ACCESS_DENIED,
        module: AUDIT_MODULES.SECURITY,
        result: "failure",
        details: `${req.method} ${req.originalUrl.split("?")[0]}`.slice(0, 300),
      });
      throw ApiError.forbidden();
    }
    next();
  };
};