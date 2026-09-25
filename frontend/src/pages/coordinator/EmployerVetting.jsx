import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCoordinatorEmployers } from "../../api/employers.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function EmployerVetting() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoordinatorEmployers().then((res) => {
      setEmployers(res.data.data.employers);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Employer Vetting</h1>
      {employers.length === 0 ? (
        <EmptyState message="No employers found." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th align="left">Company</th><th align="left">Status</th><th align="left">Open Flags</th><th></th></tr>
          </thead>
          <tbody>
            {employers.map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{e.companyName}</td>
                <td><StatusBadge status={e.accreditationStatus} /></td>
                <td>{e.openFlagCount > 0 ? <span style={{ color: "#dc2626" }}>{e.openFlagCount}</span> : "—"}</td>
                <td><Link to={`/coordinator/employers/${e.id}`}>Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}