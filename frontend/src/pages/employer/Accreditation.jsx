import { useEffect, useState } from "react";
import { getMyEmployerProfile, submitForReview, uploadEmployerDocument } from "../../api/employers.api.js";
import { getRequirements } from "../../api/requirements.api.js";
import { getMyDocuments } from "../../api/documents.api.js";
import Button from "../../components/common/Button.jsx";
import FileUpload from "../../components/forms/FileUpload.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import Toast from "../../components/common/Toast.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Accreditation() {
  const [profile, setProfile] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

    const load = async () => {
    try {
      const [profileRes, reqRes, docsRes] = await Promise.all([
        getMyEmployerProfile(), getRequirements(), getMyDocuments(),
      ]);
      setProfile(profileRes.data.data.profile);
      setRequirements(reqRes.data.data.requirements);
      setDocuments(docsRes.data.data.documents);
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not load accreditation data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const docFor = (requirementId) => documents.find((d) => d.requirementId === requirementId);
  // Note: documents.api's summary doesn't include requirementId by default (Phase 9B serializer) —
  // as a simple stand-in for now we match by documentType/name instead:
  const docForName = (name) => documents.find((d) => d.documentType === name);

  const handleUpload = async (requirementId, file) => {
    try {
      await uploadEmployerDocument({ file, requirementId });
      setToast({ type: "success", message: "Document uploaded" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Upload failed" });
    }
  };

  const handleSubmit = async () => {
    try {
      await submitForReview();
      setToast({ type: "success", message: "Submitted for review" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not submit" });
    }
  };

  if (loading) return <Spinner />;
  if (!profile) return <EmptyState message="Please complete your Company Profile first." />;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Accreditation</h1>
        <StatusBadge status={profile.accreditationStatus} />
      </div>
      {profile.accreditationRemarks && <p style={{ color: "#dc2626" }}>Remarks: {profile.accreditationRemarks}</p>}

      <h3>Required Documents</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">Requirement</th><th align="left">Status</th><th align="left"></th></tr>
        </thead>
        <tbody>
          {requirements.map((r) => {
            const doc = docForName(r.name);
            return (
              <tr key={r.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td>{r.name}</td>
                <td><StatusBadge status={doc?.status || "Missing"} /></td>
                <td>
                  {profile.accreditationStatus === "Pending" && (
                    <FileUpload label={doc ? "Replace" : "Upload"} onUpload={(file) => handleUpload(r.id, file)} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {profile.accreditationStatus === "Pending" && (
        <div style={{ marginTop: "1.5rem" }}>
          <Button onClick={handleSubmit}>Submit for Review</Button>
        </div>
      )}
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}