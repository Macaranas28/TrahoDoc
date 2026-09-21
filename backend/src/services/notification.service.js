import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";

// Other services call this. A failure here must never break the main action.
export const notifyUser = async ({ userId, category, message, link }) => {
  try {
    await Notification.create({ userId, category, message, link });
  } catch (error) {
    console.error("Notification failed:", error.message);
  }
};

export const listNotifications = async ({ userId, unreadOnly, page, limit }) => {
  const filter = { userId, ...(unreadOnly ? { isRead: false } : {}) };

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ]);
  return { items, total, unreadCount };
};

// The userId is part of the query, so nobody can touch another person's notification
export const markRead = async ({ userId, id }) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!notification) throw ApiError.notFound("Notification not found");
  return notification;
};

export const markAllRead = (userId) =>
  Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });