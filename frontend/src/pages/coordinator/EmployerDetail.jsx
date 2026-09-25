import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployerDetail, decideEmployerAccreditation, reviewRiskFlag } from "../../api/employers.api.js";
import { reviewDocument, verifyDocumentIntegrity } from "../../api/documents.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Button from "../../components/common/Button.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Toast from "../../components/common/Toast.jsx";

export default function EmployerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [remarksDraft, setRemarksDraft] = useState({});

  const load = () => getEmployerDetail(id).then((res) => {
    setEmployer(res.data.data.employer);
    setDocuments(res.data.data.documents);
    setLoading(false);
  });

  useEffect(() => { load(); }, [id]);

  const handleReviewDoc = async (docId, status) => {
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

  const handleAccreditation = async (status) => {
    const remarks = status !== "Accredited" ? prompt("Remarks for this decision:") : "";
    if (status !== "Accredited" && !remarks) return;
    try {
      await decideEmployerAccreditation(id, status, remarks);
      setToast({ type: "success", message: "Decision recorded" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not record decision" });
    }
  };

  const handleFlag = async (flagId, status) => {
    const reason = prompt(`Reason for marking this flag "${status}":`);
    if (!reason) return;
    try {
      await reviewRiskFlag(id, flagId, status, reason);
      setToast({ type: "success", message: "Flag updated" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not update flag" });
    }
  };

  if (loading) return <Spinner />;
  if (!employer) return <p>Not found.</p>;

  return (
    <div>
      <Button variant="secondary" onClick={() => navigate("/coordinator/employers")}>← Back to list</Button>
      <h1>{employer.companyName} <StatusBadge status={employer.accreditationStatus} /></h1>
      <p>{employer.contactPerson} • {employer.email} • {employer.phone}</p>
      <p>{employer.businessInformation?.address} — {employer.businessInformation?.industry}</p>
      {employer.accreditationRemarks && <p style={{ color: "#dc2626" }}>Remarks: {employer.accreditationRemarks}</p>}

      <h3>Risk Flags</h3>
      {employer.riskFlags.length === 0 ? <p style={{ color: "#6b7280" }}>None detected.</p> : (
        <ul>
          {employer.riskFlags.map((f) => (
            <li key={f.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{f.message}</strong> — severity: {f.severity}, status: {f.status}
              {f.reviewNote && <div style={{ color: "#6b7280" }}>Note: {f.reviewNote}</div>}
              {f.status === "open" && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <Button variant="secondary" onClick={() => handleFlag(f.id, "Dismissed")}>Dismiss</Button>
                  <Button variant="danger" onClick={() => handleFlag(f.id, "Confirmed")}>Confirm</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3>Accreditation Documents</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">Document</th><th align="left">Status</th><th align="left">Actions</th></tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d.id} style={{ borderTop: "1px solid #e5e7eb" }}>
              <td>{d.documentType}</td>
              <td><StatusBadge status={d.status} /></td>
              <td>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                  <Button variant="secondary" onClick={() => handleCheckIntegrity(d.id)}>Check Integrity</Button>
                  <input
                    placeholder="Remarks"
                    value={remarksDraft[d.id] || ""}
                    onChange={(e) => setRemarksDraft((prev) => ({ ...prev, [d.id]: e.target.value }))}
                    style={{ padding: "0.4rem" }}
                  />
                  <Button onClick={() => handleReviewDoc(d.id, "Verified")}>Verify</Button>
                  <Button variant="danger" onClick={() => handleReviewDoc(d.id, "Rejected")}>Reject</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "1.5rem" }}>Accreditation Decision</h3>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button onClick={() => handleAccreditation("Accredited")}>Accredit</Button>
        <Button variant="danger" onClick={() => handleAccreditation("Rejected")}>Reject</Button>
      </div>

      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}