import { listNotifications, markRead, markAllRead } from "../services/notification.service.js";

const toView = (n) => ({
  id: n._id.toString(),
  category: n.category,
  message: n.message,
  link: n.link,
  isRead: n.isRead,
  createdAt: n.createdAt,
});

export const getNotifications = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const unreadOnly = req.query.unread === "true";

  const { items, total, unreadCount } = await listNotifications({
    userId: req.user._id,
    unreadOnly,
    page,
    limit,
  });

  res.json({
    success: true,
    data: { notifications: items.map(toView), page, limit, total, unreadCount },
  });
};

export const markNotificationRead = async (req, res) => {
  const notification = await markRead({ userId: req.user._id, id: req.params.id });
  res.json({ success: true, data: { notification: toView(notification) } });
};

export const markAllNotificationsRead = async (req, res) => {
  await markAllRead(req.user._id);
  res.json({ success: true, message: "All notifications marked as read" });
};