import { useEffect, useState } from "react";
import { getMyApplications, getApplication } from "../../api/applications.api.js";
import { uploadDocument, replaceDocument } from "../../api/documents.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import FileUpload from "../../components/forms/FileUpload.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Toast from "../../components/common/Toast.jsx";

const CAN_UPLOAD_STATUSES = ["Draft", "Needs Revision"];

export default function Tracking() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = async () => {
    const res = await getMyApplications();
    const list = res.data.data.applications;
    if (list.length === 0) return setLoading(false);
    const detail = await getApplication(list[0].id);
    setApplication(detail.data.data.application);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const canUpload = application && CAN_UPLOAD_STATUSES.includes(application.status);

  const handleUpload = async (requirementId, existingDocId, file) => {
    if (existingDocId) {
      await replaceDocument(existingDocId, file);
    } else {
      await uploadDocument({ file, requirementId, applicationId: application.id });
    }
    setToast({ type: "success", message: "Document uploaded" });
    load();
  };

  if (loading) return <Spinner />;
  if (!application) return <EmptyState message="You have no applications yet." />;

  return (
    <div>
      <h1>Application Tracking</h1>
      <p><strong>{application.employer.companyName}</strong> <StatusBadge status={application.status} /></p>

      <h3>Timeline</h3>
      <ul>
        {application.timeline.map((t, i) => (
          <li key={i}>
            <StatusBadge status={t.status} /> — {new Date(t.changedAt).toLocaleString()}
            {t.remarks && <div style={{ color: "#6b7280" }}>{t.remarks}</div>}
          </li>
        ))}
      </ul>

      <h3>Document Checklist</h3>
      {!canUpload && application.status !== "Missing" && (
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          Documents can only be uploaded or replaced while the application is a Draft or Needs Revision.
        </p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th align="left">Requirement</th><th align="left">Status</th><th align="left"></th></tr>
        </thead>
        <tbody>
          {application.checklist.map((c) => (
            <tr key={c.requirementId} style={{ borderTop: "1px solid #e5e7eb" }}>
              <td>{c.name}</td>
              <td>
                <StatusBadge status={c.status} />
                {c.document?.remarks && <div style={{ color: "#dc2626", fontSize: "0.85rem" }}>{c.document.remarks}</div>}
              </td>
              <td>
                {canUpload && c.status !== "Verified" && (
                  <FileUpload
                    label={c.status === "Missing" ? "Upload" : "Replace"}
                    onUpload={(file) => handleUpload(c.requirementId, c.document?.id, file)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}