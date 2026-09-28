import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Undo2, XCircle } from "lucide-react";
import { getCoordinatorApplication, changeApplicationStatus } from "../../api/applications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import RemarksModal from "../../components/ui/RemarksModal.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";
import DocumentActions from "../../components/coordinator/DocumentActions.jsx";

const DECISIONS = {
  Approved: { title: "Approve this application?", desc: "Every required document must be Verified first.", variant: "primary", label: "Approve", required: false },
  "Needs Revision": { title: "Send back for revision?", desc: "The student will be notified and can upload new documents.", variant: "primary", label: "Send back", required: true },
  Rejected: { title: "Reject this application?", desc: "The student will be notified with your remarks.", variant: "danger", label: "Reject application", required: true },
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [decision, setDecision] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    getCoordinatorApplication(id)
      .then((res) => setApplication(res.data.data.application))
      .catch((err) => setToast({ type: "error", message: err.response?.data?.message || "Could not load application" }))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const decide = async (remarks) => {
    setBusy(true);
    try {
      await changeApplicationStatus(id, decision, remarks);
      setToast({ type: "success", message: `Application marked ${decision}` });
      setDecision(null);
      await load();
    } catch (err) {
      setDecision(null);
      setToast({ type: "error", message: err.response?.data?.message || "Could not update status" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!application) return <p className="text-sm text-muted">Application not found.</p>;

  const open = ["Submitted", "Under Review"].includes(application.status);
  const cfg = decision ? DECISIONS[decision] : null;

  return (
    <div>
      <Link to="/coordinator/applications" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-900 mb-3">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>
      <PageHeader title={application.employer.companyName} subtitle="Review each document, then make a decision." action={<Badge status={application.status} />} />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Document checklist" />
          <Table>
            <thead><tr><Th>Requirement</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
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
                  <Td>
                    {c.document ? (
                      <DocumentActions docId={c.document.id} docName={c.name} status={c.status} onDone={load} notify={setToast} />
                    ) : <span className="text-xs text-muted">Not uploaded</span>}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Decision" />
            {open ? (
              <div className="flex flex-col gap-2">
                <Button icon={CheckCircle2} onClick={() => setDecision("Approved")}>Approve</Button>
                <Button variant="secondary" icon={Undo2} onClick={() => setDecision("Needs Revision")}>Send back for revision</Button>
                <Button variant="danger" icon={XCircle} onClick={() => setDecision("Rejected")}>Reject application</Button>
              </div>
            ) : (
              <p className="text-sm text-muted">This application is <strong>{application.status}</strong>. No further decision is needed.</p>
            )}
          </Card>

          <Card>
            <CardHeader title="History" />
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
      </div>

      <RemarksModal
        open={!!decision}
        title={cfg?.title}
        description={cfg?.desc}
        required={cfg?.required}
        confirmLabel={cfg?.label}
        confirmVariant={cfg?.variant}
        busy={busy}
        onClose={() => setDecision(null)}
        onSubmit={decide}
      />
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}