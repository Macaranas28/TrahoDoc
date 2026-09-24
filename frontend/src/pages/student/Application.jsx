import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccreditedEmployers } from "../../api/employers.api.js";
import { createApplication, getMyApplications, submitApplication, withdrawApplication } from "../../api/applications.api.js";
import Button from "../../components/common/Button.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Toast from "../../components/common/Toast.jsx";

const ACTIVE = ["Draft", "Submitted", "Under Review", "Needs Revision", "Approved"];

export default function Application() {
  const [employers, setEmployers] = useState([]);
  const [selected, setSelected] = useState("");
  const [current, setCurrent] = useState(null); // the active application, if any
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const [employersRes, appsRes] = await Promise.all([getAccreditedEmployers(), getMyApplications()]);
    setEmployers(employersRes.data.data.employers);
    const active = appsRes.data.data.applications.find((a) => ACTIVE.includes(a.status));
    setCurrent(active || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createApplication(selected);
      setToast({ type: "success", message: "Application created" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not create application" });
    }
  };

  const handleSubmit = async () => {
    try {
      await submitApplication(current.id);
      setToast({ type: "success", message: "Application submitted" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not submit" });
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Withdraw this application? This cannot be undone.")) return;
    try {
      await withdrawApplication(current.id);
      setToast({ type: "info", message: "Application withdrawn" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not withdraw" });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>OJT Application</h1>

      {current ? (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", maxWidth: 480 }}>
          <p><strong>{current.employer.companyName}</strong> <StatusBadge status={current.status} /></p>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            {["Draft", "Needs Revision"].includes(current.status) && (
              <Button onClick={handleSubmit}>Submit</Button>
            )}
            <Button variant="danger" onClick={handleWithdraw}>Withdraw</Button>
                        <Button variant="secondary" onClick={() => navigate("/student/tracking")}>
              {["Draft", "Needs Revision"].includes(current.status) ? "Upload Documents" : "View Tracking"}
            </Button>
          </div>
        </div>
      ) : employers.length === 0 ? (
        <EmptyState message="No accredited employers are available yet." />
      ) : (
        <div style={{ maxWidth: 420 }}>
          <label>Choose an employer</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}>
            <option value="">Select…</option>
            {employers.map((e) => <option key={e.id} value={e.id}>{e.companyName}</option>)}
          </select>
          <Button onClick={handleCreate} disabled={!selected}>Create Draft Application</Button>
        </div>
      )}

      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}