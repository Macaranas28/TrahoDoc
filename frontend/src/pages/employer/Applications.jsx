import { useEffect, useState } from "react";
import { getEmployerApplications, respondToApplication } from "../../api/applications.api.js";
import Button from "../../components/common/Button.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Toast from "../../components/common/Toast.jsx";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = () => getEmployerApplications().then((res) => {
    setApplications(res.data.data.applications);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      await respondToApplication(id, status);
      setToast({ type: "success", message: `Application ${status.toLowerCase()}` });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not respond" });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Applications</h1>
      {applications.length === 0 ? (
        <EmptyState message="No applications yet." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th align="left">Student</th><th align="left">Course</th><th align="left">Status</th><th align="left">Response</th><th></th></tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{a.student.name}</td>
                <td>{a.student.course}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>{a.employerResponse?.status !== "Pending" ? <StatusBadge status={a.employerResponse.status} /> : "—"}</td>
                <td>
                  {a.status === "Approved" && a.employerResponse?.status === "Pending" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button onClick={() => respond(a.id, "Accepted")}>Accept</Button>
                      <Button variant="danger" onClick={() => respond(a.id, "Declined")}>Decline</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}