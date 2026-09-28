import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { getEmployerDetail, decideEmployerAccreditation, reviewRiskFlag } from "../../api/employers.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import RemarksModal from "../../components/ui/RemarksModal.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";
import DocumentActions from "../../components/coordinator/DocumentActions.jsx";

export default function EmployerDetail() {
  const { id } = useParams();
  const [employer, setEmployer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState(null); // "Accredited" | "Rejected"
  const [flagAction, setFlagAction] = useState(null); // { flagId, status }

  const load = () =>
    getEmployerDetail(id)
      .then((res) => {
        setEmployer(res.data.data.employer);
        setDocuments(res.data.data.documents);
      })
      .catch((err) => setToast({ type: "error", message: err.response?.data?.message || "Could not load employer" }))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const submitDecision = async (remarks) => {
    setBusy(true);
    try {
      await decideEmployerAccreditation(id, decision, remarks);
      setToast({ type: "success", message: "Decision recorded" });
      setDecision(null);
      await load();
    } catch (err) {
      setDecision(null);
      setToast({ type: "error", message: err.response?.data?.message || "Could not record decision" });
    } finally {
      setBusy(false);
    }
  };

  const submitFlag = async (reason) => {
    setBusy(true);
    try {
      await reviewRiskFlag(id, flagAction.flagId, flagAction.status, reason);
      setToast({ type: "success", message: "Risk indicator updated" });
      setFlagAction(null);
      await load();
    } catch (err) {
      setFlagAction(null);
      setToast({ type: "error", message: err.response?.data?.message || "Could not update indicator" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!employer) return <p className="text-sm text-muted">Employer not found.</p>;

  const canDecide = employer.accreditationStatus === "Under Review";
  const openFlags = employer.riskFlags.filter((f) => f.status === "open");

  return (
    <div>
      <Link to="/coordinator/employers" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-900 mb-3">
        <ArrowLeft className="h-4 w-4" /> Back to employers
      </Link>
      <PageHeader title={employer.companyName} subtitle={`${employer.contactPerson} · ${employer.email} · ${employer.phone}`} action={<Badge status={employer.accreditationStatus} />} />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Business information" />
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-muted">Address</dt><dd className="font-medium">{employer.businessInformation?.address || "—"}</dd></div>
              <div><dt className="text-muted">Industry</dt><dd className="font-medium">{employer.businessInformation?.industry || "—"}</dd></div>
              <div><dt className="text-muted">Website</dt><dd className="font-medium">{employer.businessInformation?.website || "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted">Description</dt><dd>{employer.businessInformation?.description || "—"}</dd></div>
            </dl>
            {employer.accreditationRemarks && <p className="text-sm text-danger mt-4">Previous remarks: {employer.accreditationRemarks}</p>}
          </Card>

          <Card>
            <CardHeader title="Accreditation documents" />
            <Table>
              <thead><tr><Th>Document</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <Td>
                      <p className="font-medium">{d.documentType}</p>
                      <p className="text-xs text-muted">{d.fileName}</p>
                    </Td>
                    <Td><Badge status={d.status} /></Td>
                    <Td><DocumentActions docId={d.id} docName={d.documentType} status={d.status} onDone={load} notify={setToast} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Risk indicators" subtitle="Prompts to look closer. Not proof of a problem." />
            {employer.riskFlags.length === 0 ? (
              <p className="text-sm text-muted">No indicators detected.</p>
            ) : (
              <ul className="space-y-3">
                {employer.riskFlags.map((f) => (
                  <li key={f.id} className="text-sm border border-border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${f.status === "open" ? "text-warning" : "text-slate-400"}`} />
                      <div className="flex-1">
                        <p>{f.message}</p>
                        <p className="text-xs text-muted mt-1">Severity: {f.severity} · {f.status === "open" ? "Needs review" : f.status}</p>
                        {f.reviewNote && <p className="text-xs text-slate-600 mt-1">Note: {f.reviewNote}</p>}
                      </div>
                    </div>
                    {f.status === "open" && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="secondary" onClick={() => setFlagAction({ flagId: f.id, status: "Dismissed" })}>Dismiss</Button>
                        <Button size="sm" variant="secondary" onClick={() => setFlagAction({ flagId: f.id, status: "Confirmed" })}>Confirm</Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Accreditation decision" />
            {canDecide ? (
              <>
                {openFlags.length > 0 && <p className="text-xs text-warning mb-3">{openFlags.length} risk indicator(s) still need your review.</p>}
                <div className="flex flex-col gap-2">
                  <Button icon={CheckCircle2} onClick={() => setDecision("Accredited")}>Accredit employer</Button>
                  <Button variant="danger" icon={XCircle} onClick={() => setDecision("Rejected")}>Reject</Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">
                Status is <strong>{employer.accreditationStatus}</strong>. A decision can only be made while an employer is Under Review.
              </p>
            )}
          </Card>
        </div>
      </div>

      <RemarksModal
        open={!!decision}
        title={decision === "Accredited" ? "Accredit this employer?" : "Reject accreditation?"}
        description={decision === "Accredited" ? "All required documents must be Verified first." : "The employer will be notified with your remarks."}
        required={decision === "Rejected"}
        confirmLabel={decision === "Accredited" ? "Accredit" : "Reject"}
        confirmVariant={decision === "Accredited" ? "primary" : "danger"}
        busy={busy}
        onClose={() => setDecision(null)}
        onSubmit={submitDecision}
      />
      <RemarksModal
        open={!!flagAction}
        title={`Mark indicator as ${flagAction?.status}`}
        description="Explain what you checked. This is saved in the review history."
        required
        confirmLabel="Save"
        busy={busy}
        onClose={() => setFlagAction(null)}
        onSubmit={submitFlag}
      />
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}