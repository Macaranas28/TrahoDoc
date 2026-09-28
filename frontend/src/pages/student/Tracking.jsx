import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { getMyApplications, getApplication } from "../../api/applications.api.js";
import { uploadDocument, replaceDocument } from "../../api/documents.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import FileUpload from "../../components/forms/FileUpload.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";

const CAN_UPLOAD = ["Draft", "Needs Revision"];

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

  const canUpload = application && CAN_UPLOAD.includes(application.status);

  const handleUpload = async (requirementId, existingDocId, file) => {
    if (existingDocId) await replaceDocument(existingDocId, file);
    else await uploadDocument({ file, requirementId, applicationId: application.id });
    setToast({ type: "success", message: "Document uploaded" });
    load();
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!application) {
    return (
      <div>
        <PageHeader title="Application Tracking" />
        <Card><EmptyState icon={ClipboardCheck} title="No applications yet" message="Create an OJT application to start tracking it here." /></Card>
      </div>
    );
  }

  const done = application.checklist.filter((c) => c.status !== "Missing").length;

  return (
    <div>
      <PageHeader
        title="Application Tracking"
        subtitle={application.employer.companyName}
        action={<Badge status={application.status} />}
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Document checklist" subtitle={`${done} of ${application.checklist.length} uploaded`} />
          {!canUpload && <p className="text-xs text-muted mb-3">Documents can only be uploaded or replaced while the application is a Draft or Needs Revision.</p>}
          <Table>
            <thead><tr><Th>Requirement</Th><Th>Status</Th><Th> </Th></tr></thead>
            <tbody>
              {application.checklist.map((c) => (
                <tr key={c.requirementId}>
                  <Td>
                    <p className="font-medium">{c.name}</p>
                    {c.document?.fileName && <p className="text-xs text-muted">{c.document.fileName}</p>}
                  </Td>
                  <Td>
                    <Badge status={c.status} />
                    {c.document?.remarks && <p className="text-xs text-danger mt-1">{c.document.remarks}</p>}
                  </Td>
                  <Td className="text-right">
                    {canUpload && c.status !== "Verified" && (
                      <FileUpload
                        label={c.status === "Missing" ? "Upload" : "Replace"}
                        onUpload={(file) => handleUpload(c.requirementId, c.document?.id, file)}
                      />
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Timeline" />
          <ol className="space-y-4">
            {application.timeline.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
                <div>
                  <Badge status={t.status} />
                  <p className="text-xs text-muted mt-1">{new Date(t.changedAt).toLocaleString()}</p>
                  {t.remarks && <p className="text-sm text-slate-600 mt-1">{t.remarks}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}