import api from "./axios.js";

export const getAuditLogs = (params) => api.get("/audit-logs", { params });
export const getAuditLogOptions = () => api.get("/audit-logs/actions");