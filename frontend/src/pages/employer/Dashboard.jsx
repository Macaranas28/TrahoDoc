import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEmployerProfile } from "../../api/employers.api.js";
import { getEmployerApplications } from "../../api/applications.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyEmployerProfile(), getEmployerApplications()]).then(([profileRes, appsRes]) => {
      setProfile(profileRes.data.data.profile);
      setApplications(appsRes.data.data.applications);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Employer Dashboard</h1>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", minWidth: 220 }}>
          <h3>Accreditation</h3>
          {profile ? <StatusBadge status={profile.accreditationStatus} /> : <EmptyState message="No profile yet." />}
          <p><Link to="/employer/profile">Go to Company Profile →</Link></p>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", minWidth: 220 }}>
          <h3>Applications</h3>
          <p>{applications.length} total</p>
          <p><Link to="/employer/applications">View Applications →</Link></p>
        </div>
      </div>
    </div>
  );
}