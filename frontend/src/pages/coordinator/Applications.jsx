import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCoordinatorApplications } from "../../api/applications.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCoordinatorApplications()
      .then((res) => setApplications(res.data.data.applications))
      .catch((err) => setError(err.response?.data?.message || "Could not load applications"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Student Applications</h1>
      {applications.length === 0 ? (
        <EmptyState message="No applications assigned to you yet." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th align="left">Student</th><th align="left">Employer</th><th align="left">Status</th><th></th></tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{a.student?.name}</td>
                <td>{a.employer?.companyName}</td>
                <td><StatusBadge status={a.status} /></td>
                <td><Link to={`/coordinator/applications/${a.id}`}>Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}