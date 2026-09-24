import { listAuditLogs, listPossibleActions, listPossibleModules } from "../services/auditLog.service.js";

const toView = (log) => ({
  id: log._id.toString(),
  actor: log.userId ? { id: log.userId._id.toString(), name: log.userId.name, role: log.userId.role } : null,
  actorEmail: log.actorEmail,
  action: log.action,
  module: log.module,
  targetId: log.targetId,
  result: log.result,
  details: log.details,
  ipAddress: log.ipAddress,
  timestamp: log.timestamp,
});

export const getAuditLogs = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 25;
  const { logs, total } = await listAuditLogs({
    action: req.query.action, module: req.query.module, result: req.query.result,
    userId: req.query.userId, from: req.query.from, to: req.query.to, page, limit,
  });
  res.json({ success: true, data: { logs: logs.map(toView), page, limit, total } });
};

export const getAuditLogOptions = (req, res) => {
  res.json({ success: true, data: { actions: listPossibleActions(), modules: listPossibleModules() } });
};