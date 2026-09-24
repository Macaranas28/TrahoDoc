import { getCoordinatorSummary, getAdminSummary } from "../services/dashboard.service.js";
import { ROLES } from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";

export const getDashboard = async (req, res) => {
  switch (req.user.role) {
    case ROLES.COORDINATOR:
      return res.json({ success: true, data: await getCoordinatorSummary(req.user) });
    case ROLES.ADMIN:
      return res.json({ success: true, data: await getAdminSummary() });
    default:
      // Student and Employer dashboards already fetch their data via separate,
      // already-working endpoints (Phases 9C/10B) — nothing to add for them here.
      throw ApiError.badRequest("No summary dashboard defined for this role");
  }
};