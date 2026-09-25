import { useEffect, useState } from "react";
import { getCoordinatorApplications } from "../../api/applications.api.js";
import { reviewDocument, verifyDocumentIntegrity } from "../../api/documents.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Toast from "../../components/common/Toast.jsx";

export default function DocumentVerification() {
  const [queue, setQueue] = useState([]); // flattened list of { applicationId, studentName, requirementId, name, document }
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [remarksDraft, setRemarksDraft] = useState({});

  const load = async () => {
    const res = await getCoordinatorApplications();
    // We need per-application detail to see the checklist; keep it simple and reasonably small (a coordinator's own list)
    const { getCoordinatorApplication } = await import("../../api/applications.api.js");
    const details = await Promise.all(res.data.data.applications.map((a) => getCoordinatorApplication(a.id)));
    const flat = [];
    details.forEach(({ data }) => {
      const app = data.data.application;
      app.checklist.forEach((c) => {
        if (c.status === "Pending" || c.status === "Possible Modification") {
          flat.push({ applicationId: app.id, employerName: app.employer.companyName, ...c });
        }
      });
    });
    setQueue(flat);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (docId, status) => {
    const remarks = remarksDraft[docId];
    if (status === "Rejected" && !remarks) {
      setToast({ type: "error", message: "Please enter remarks before rejecting" });
      return;
    }
    try {
      await reviewDocument(docId, status, remarks);
      setToast({ type: "success", message: `Document ${status.toLowerCase()}` });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Review failed" });
    }
  };

  const handleCheckIntegrity = async (docId) => {
    try {
      const res = await verifyDocumentIntegrity(docId);
      setToast({ type: res.data.data.matched ? "success" : "error", message: res.data.message });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Check failed" });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Document Verification Queue</h1>
      {queue.length === 0 ? (
        <EmptyState message="No documents waiting for review." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr><th align="left">Employer</th><th align="left">Requirement</th><th align="left">Status</th><th align="left">Actions</th></tr>
          </thead>
          <tbody>
            {queue.map((c) => (
              <tr key={c.document.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{c.employerName}</td>
                <td>{c.name}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <Button variant="secondary" onClick={() => handleCheckIntegrity(c.document.id)}>Check Integrity</Button>
                    <input
                      placeholder="Remarks"
                      value={remarksDraft[c.document.id] || ""}
                      onChange={(e) => setRemarksDraft((prev) => ({ ...prev, [c.document.id]: e.target.value }))}
                      style={{ padding: "0.4rem" }}
                    />
                    <Button onClick={() => handleReview(c.document.id, "Verified")}>Verify</Button>
                    <Button variant="danger" onClick={() => handleReview(c.document.id, "Rejected")}>Reject</Button>
                  </div>
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