import mongoose from "mongoose";
import { NOTIFICATION_CATEGORIES } from "../utils/constants.js";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: Object.values(NOTIFICATION_CATEGORIES), required: true },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    link: { type: String, trim: true, maxlength: 200 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// Auto-delete notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default model("Notification", notificationSchema);