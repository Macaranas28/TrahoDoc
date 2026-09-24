import AuditLog from "../models/AuditLog.js";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";

export const listAuditLogs = async ({ action, module, result, userId, from, to, page, limit }) => {
  const filter = {};
  if (action) filter.action = action;
  if (module) filter.module = module;
  if (result) filter.result = result;
  if (userId) filter.userId = userId;
  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("userId", "name email role")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  return { logs, total };
};

export const listPossibleActions = () => Object.values(AUDIT_ACTIONS);
export const listPossibleModules = () => Object.values(AUDIT_MODULES);