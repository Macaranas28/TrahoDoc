import AuditLog from "../models/AuditLog.js";

export const logAction = async ({
  req,
  userId = null,
  actorEmail,
  action,
  module,
  targetId = null,
  result = "success",
  details,
}) => {
  try {
    await AuditLog.create({
      userId,
      actorEmail,
      action,
      module,
      targetId,
      result,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("user-agent")?.slice(0, 300),
    });
  } catch (error) {
    // A logging problem must never break login. Report it and continue.
    console.error("Audit log failed:", error.message);
  }
};