import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Send, Upload, Trash2 } from "lucide-react";
import { getAccreditedEmployers } from "../../api/employers.api.js";
import { createApplication, getMyApplications, submitApplication, withdrawApplication } from "../../api/applications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";

const ACTIVE = ["Draft", "Submitted", "Under Review", "Needs Revision", "Approved"];

export default function Application() {
  const navigate = useNavigate();
  const [employers, setEmployers] = useState([]);
  const [selected, setSelected] = useState("");
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    const [employersRes, appsRes] = await Promise.all([getAccreditedEmployers(), getMyApplications()]);
    setEmployers(employersRes.data.data.employers);
    setCurrent(appsRes.data.data.applications.find((a) => ACTIVE.includes(a.status)) || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const run = async (fn, okMessage) => {
    setBusy(true);
    try {
      await fn();
      setToast({ type: "success", message: okMessage });
      await load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Something went wrong" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-48 max-w-2xl" />;

  const canEdit = current && ["Draft", "Needs Revision"].includes(current.status);

  return (
    <div>
      <PageHeader title="OJT Application" subtitle="Apply to an accredited employer and track your application." />

      {current ? (
        <Card className="max-w-2xl">
          <CardHeader title="Your application" />
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-light text-primary flex items-center justify-center"><Building2 className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted">Employer</p>
                <p className="font-semibold">{current.employer.companyName}</p>
              </div>
            </div>
            <Badge status={current.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            {canEdit && <Button icon={Upload} variant="secondary" onClick={() => navigate("/student/tracking")}>Upload documents</Button>}
            {canEdit && <Button icon={Send} loading={busy} onClick={() => run(() => submitApplication(current.id), "Application submitted")}>Submit application</Button>}
            {!canEdit && <Button variant="secondary" onClick={() => navigate("/student/tracking")}>View tracking</Button>}
            <Button icon={Trash2} variant="danger" onClick={() => setConfirmWithdraw(true)}>Withdraw</Button>
          </div>
        </Card>
      ) : employers.length === 0 ? (
        <Card><EmptyState icon={Building2} title="No accredited employers yet" message="Employers must be accredited by a coordinator before you can apply to them." /></Card>
      ) : (
        <Card className="max-w-md">
          <CardHeader title="Choose an employer" subtitle="Only accredited employers are listed." />
          <Field label="Employer">
            <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Select an employer…</option>
              {employers.map((e) => <option key={e.id} value={e.id}>{e.companyName}</option>)}
            </Select>
          </Field>
          <Button disabled={!selected} loading={busy} onClick={() => run(() => createApplication(selected), "Draft application created")}>
            Create draft application
          </Button>
        </Card>
      )}

      <Modal
        open={confirmWithdraw}
        title="Withdraw application?"
        confirmLabel="Withdraw"
        confirmVariant="danger"
        busy={busy}
        onClose={() => setConfirmWithdraw(false)}
        onConfirm={async () => {
          await run(() => withdrawApplication(current.id), "Application withdrawn");
          setConfirmWithdraw(false);
        }}
      >
        <p className="text-sm text-slate-600">This cannot be undone. You can create a new application afterwards.</p>
      </Modal>

      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}