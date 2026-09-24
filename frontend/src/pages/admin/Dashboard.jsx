import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../../api/dashboard.api.js";
import Spinner from "../../components/common/Spinner.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then((res) => {
      setSummary(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h3>Users</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {Object.entries(summary.userCounts).map(([role, count]) => (
          <div key={role} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", minWidth: 140 }}>
            <p style={{ textTransform: "capitalize", margin: 0, color: "#6b7280" }}>{role}s</p>
            <p style={{ fontSize: "1.75rem", margin: "0.25rem 0" }}>{count}</p>
          </div>
        ))}
      </div>
      <p style={{ marginTop: "0.5rem" }}><Link to="/admin/users">Manage Users →</Link></p>

      <h3 style={{ marginTop: "2rem" }}>System</h3>
      <p>Total applications: {summary.totalApplications}</p>
      <p>Total employers: {summary.totalEmployers} ({summary.accreditedEmployers} accredited)</p>

      <h3 style={{ marginTop: "2rem" }}>Recent Activity ({summary.activityLast24h} events in last 24h)</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">Action</th><th align="left">Actor</th><th align="left">Result</th><th align="left">Time</th></tr>
        </thead>
        <tbody>
          {summary.recentActivity.map((a, i) => (
            <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
              <td>{a.action}</td>
              <td>{a.actor}</td>
              <td style={{ color: a.result === "failure" ? "#dc2626" : "#16a34a" }}>{a.result}</td>
              <td>{new Date(a.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: "0.5rem" }}><Link to="/admin/audit-logs">View Full Audit Log →</Link></p>
    </div>
  );
}