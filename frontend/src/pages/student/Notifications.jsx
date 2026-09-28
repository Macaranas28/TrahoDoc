import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/notifications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getNotifications().then((res) => {
    setItems(res.data.data.notifications);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Updates about your application and documents."
        action={hasUnread && <Button variant="secondary" icon={CheckCheck} onClick={async () => { await markAllNotificationsRead(); load(); }}>Mark all as read</Button>}
      />
      <Card className="p-0">
        {loading ? <div className="p-6"><Skeleton className="h-32" /></div> : items.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" message="New notifications will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => (
              <li
                key={n.id}
                onClick={async () => { if (!n.isRead) { await markNotificationRead(n.id); load(); } }}
                className={`flex gap-3 px-5 py-4 ${n.isRead ? "" : "bg-primary-light/60 cursor-pointer hover:bg-primary-light"}`}
              >
                <span className={`mt-2 h-2 w-2 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-primary"}`} />
                <div>
                  <p className={`text-sm ${n.isRead ? "text-slate-600" : "text-slate-900 font-medium"}`}>{n.message}</p>
                  <p className="text-xs text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}