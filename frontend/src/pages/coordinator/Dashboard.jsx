import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../../api/dashboard.api.js";
import Spinner from "../../components/common/Spinner.jsx";

function StatCard({ title, value, linkTo, linkLabel }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", minWidth: 200 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{value}</p>
      {linkTo && <Link to={linkTo}>{linkLabel} →</Link>}
    </div>
  );
}

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
      <h1>Coordinator Dashboard</h1>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <StatCard title="Pending Applications" value={summary.pendingApplications} linkTo="/coordinator/applications" linkLabel="Review" />
        <StatCard title="Pending Document Verification" value={summary.pendingDocumentVerification} linkTo="/coordinator/documents" linkLabel="Verify" />
        <StatCard title="Employer Accreditation Requests" value={summary.employerAccreditationRequests} linkTo="/coordinator/employers" linkLabel="Review" />
        <StatCard title="Risk Indicators" value={summary.riskIndicators} linkTo="/coordinator/employers" linkLabel="View" />
      </div>
      <h3 style={{ marginTop: "2rem" }}>Summary</h3>
      <p>Approved applications: {summary.stats.approvedApplications}</p>
      <p>Rejected applications: {summary.stats.rejectedApplications}</p>
    </div>
  );
}