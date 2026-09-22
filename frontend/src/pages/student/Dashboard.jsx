import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyApplications } from "../../api/applications.api.js";
import { getNotifications } from "../../api/notifications.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Dashboard() {
  const [application, setApplication] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyApplications(), getNotifications({ limit: 1 })]).then(([appsRes, notifRes]) => {
      setApplication(appsRes.data.data.applications[0] || null);
      setUnreadCount(notifRes.data.data.unreadCount);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Student Dashboard</h1>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", minWidth: 220 }}>
          <h3>Application</h3>
          {application ? (
            <>
              <p>{application.employer.companyName}</p>
              <StatusBadge status={application.status} />
            </>
          ) : (
            <EmptyState message="No application yet." />
          )}
          <p><Link to="/student/application">Go to Application →</Link></p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", minWidth: 220 }}>
          <h3>Notifications</h3>
          <p>{unreadCount} unread</p>
          <p><Link to="/student/notifications">View Notifications →</Link></p>
        </div>
      </div>
    </div>
  );
}