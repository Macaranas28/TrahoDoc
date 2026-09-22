import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/notifications.api.js";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => getNotifications().then((res) => {
    setItems(res.data.data.notifications);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead();
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Notifications</h1>
        <Button variant="secondary" onClick={handleReadAll}>Mark all read</Button>
      </div>
      {items.length === 0 ? (
        <EmptyState message="No notifications yet." />
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((n) => (
            <li
              key={n.id}
              onClick={() => !n.isRead && handleRead(n.id)}
              style={{
                padding: "0.75rem", borderBottom: "1px solid #e5e7eb",
                background: n.isRead ? "#fff" : "#eff6ff", cursor: n.isRead ? "default" : "pointer",
              }}
            >
              <p>{n.message}</p>
              <small style={{ color: "#6b7280" }}>{new Date(n.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}