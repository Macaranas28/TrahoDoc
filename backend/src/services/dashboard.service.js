import Application from "../models/Application.js";
import Document from "../models/Document.js";
import Employer from "../models/Employer.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { ACCREDITATION_STATUS, APPLICATION_STATUS, DOCUMENT_STATUS, ROLES } from "../utils/constants.js";

export const getCoordinatorSummary = async (user) => {
  const assignedFilter = { assignedCoordinatorId: user._id };

  const [pendingApplications, approvedCount, rejectedCount, pendingDocs, employerRequests, riskyEmployers] =
    await Promise.all([
      Application.countDocuments({ ...assignedFilter, status: { $in: [APPLICATION_STATUS.SUBMITTED, APPLICATION_STATUS.UNDER_REVIEW] } }),
      Application.countDocuments({ ...assignedFilter, status: APPLICATION_STATUS.APPROVED }),
      Application.countDocuments({ ...assignedFilter, status: APPLICATION_STATUS.REJECTED }),
      Document.countDocuments({ verificationStatus: DOCUMENT_STATUS.PENDING }), // any coordinator can review any pending doc
      Employer.countDocuments({ accreditationStatus: ACCREDITATION_STATUS.UNDER_REVIEW }),
      Employer.countDocuments({ "riskFlags.status": "open" }),
    ]);

  return {
    pendingApplications,
    pendingDocumentVerification: pendingDocs,
    employerAccreditationRequests: employerRequests,
    riskIndicators: riskyEmployers,
    stats: { approvedApplications: approvedCount, rejectedApplications: rejectedCount },
  };
};

export const getAdminSummary = async () => {
  const [usersByRole, totalApplications, totalEmployers, accreditedEmployers, recentLogs, logsLast24h] =
    await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Application.countDocuments({}),
      Employer.countDocuments({}),
      Employer.countDocuments({ accreditationStatus: ACCREDITATION_STATUS.ACCREDITED }),
      AuditLog.find({}).sort({ timestamp: -1 }).limit(5).populate("userId", "name role"),
      AuditLog.countDocuments({ timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    ]);

  const roleCounts = Object.fromEntries(Object.values(ROLES).map((r) => [r, 0]));
  usersByRole.forEach(({ _id, count }) => { if (_id in roleCounts) roleCounts[_id] = count; });

  return {
    userCounts: roleCounts,
    totalApplications,
    totalEmployers,
    accreditedEmployers,
    activityLast24h: logsLast24h,
    recentActivity: recentLogs.map((l) => ({
      action: l.action,
      actor: l.userId?.name || l.actorEmail || "Unknown",
      result: l.result,
      timestamp: l.timestamp,
    })),
  };
};