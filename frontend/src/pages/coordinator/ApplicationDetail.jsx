import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCoordinatorApplication, changeApplicationStatus } from "../../api/applications.api.js";
import { openDocumentForReview, reviewDocument, verifyDocumentIntegrity } from "../../api/documents.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Toast from "../../components/common/Toast.jsx";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [remarksDraft, setRemarksDraft] = useState({}); // { [requirementId]: text }

  const load = () => getCoordinatorApplication(id).then((res) => {
    setApplication(res.data.data.application);
    setLoading(false);
  });

  useEffect(() => { load(); }, [id]);

  const handleCheckIntegrity = async (docId) => {
    try {
      const res = await openDocumentForReview(docId); // runs the integrity check server-side, per Phase 13
      setToast({
        type: res.data.data.integrityMatched ? "success" : "error",
        message: res.data.data.integrityMatched ? "No changes detected" : "Possible modification detected!",
      });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Check failed" });
    }
  };

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

  const handleAppStatus = async (status) => {
    const remarks = status !== "Approved" ? prompt(`Remarks for marking this application "${status}":`) : "";
    if (status !== "Approved" && !remarks) return; // cancelled or empty
    try {
      await changeApplicationStatus(id, status, remarks);
      setToast({ type: "success", message: "Application status updated" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not update status" });
    }
  };

  if (loading) return <Spinner />;
  if (!application) return <p>Not found.</p>;

  return (
    <div>
      <Button variant="secondary" onClick={() => navigate("/coordinator/applications")}>← Back to list</Button>
      <h1>{application.employer.companyName} <StatusBadge status={application.status} /></h1>

      <h3>Document Checklist</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">Requirement</th><th align="left">Status</th><th align="left">Actions</th></tr>
        </thead>
        <tbody>
          {application.checklist.map((c) => (
            <tr key={c.requirementId} style={{ borderTop: "1px solid #e5e7eb" }}>
              <td>{c.name}</td>
              <td><StatusBadge status={c.status} /></td>
              <td>
                {c.document && !["Missing"].includes(c.status) && (
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <Button variant="secondary" onClick={() => handleCheckIntegrity(c.document.id)}>Check Integrity</Button>
                    <input
                      placeholder="Remarks (required to reject)"
                      value={remarksDraft[c.document.id] || ""}
                      onChange={(e) => setRemarksDraft((prev) => ({ ...prev, [c.document.id]: e.target.value }))}
                      style={{ padding: "0.4rem" }}
                    />
                    <Button onClick={() => handleReview(c.document.id, "Verified")}>Verify</Button>
                    <Button variant="danger" onClick={() => handleReview(c.document.id, "Rejected")}>Reject</Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "1.5rem" }}>Application Decision</h3>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button onClick={() => handleAppStatus("Approved")}>Approve</Button>
        <Button variant="secondary" onClick={() => handleAppStatus("Needs Revision")}>Send Back (Needs Revision)</Button>
        <Button variant="danger" onClick={() => handleAppStatus("Rejected")}>Reject Application</Button>
      </div>

      <h3 style={{ marginTop: "1.5rem" }}>Status History</h3>
      <ul>
        {application.timeline.map((t, i) => (
          <li key={i}><StatusBadge status={t.status} /> — {new Date(t.changedAt).toLocaleString()} {t.remarks && `— ${t.remarks}`}</li>
        ))}
      </ul>

      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}