import mongoose from "mongoose";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "../utils/constants.js";

const { Schema, model } = mongoose;

// immutable: true means a field cannot be changed after the log is created.
// (Phase 15 adds stronger protection: no update/delete routes at all.)
const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, immutable: true },
    actorEmail: { type: String, lowercase: true, trim: true, maxlength: 254, immutable: true },
    action: { type: String, enum: Object.values(AUDIT_ACTIONS), required: true, immutable: true },
    module: { type: String, enum: Object.values(AUDIT_MODULES), required: true, immutable: true },
    targetId: { type: Schema.Types.ObjectId, default: null, immutable: true },
    result: { type: String, enum: ["success", "failure"], required: true, immutable: true },
    ipAddress: { type: String, maxlength: 45, immutable: true },
    userAgent: { type: String, maxlength: 300, immutable: true },
    details: { type: String, maxlength: 500, immutable: true }, // never store passwords or tokens here
    timestamp: { type: Date, default: Date.now, immutable: true },
  },
  { versionKey: false }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

export default model("AuditLog", auditLogSchema);