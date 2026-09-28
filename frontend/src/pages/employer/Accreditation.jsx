import { useEffect, useState } from "react";
import { Send, Building2 } from "lucide-react";
import { getMyEmployerProfile, submitForReview, uploadEmployerDocument } from "../../api/employers.api.js";
import { getRequirements } from "../../api/requirements.api.js";
import { getMyDocuments } from "../../api/documents.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import FileUpload from "../../components/forms/FileUpload.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";

export default function Accreditation() {
  const [profile, setProfile] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    try {
      const [p, r, d] = await Promise.all([getMyEmployerProfile(), getRequirements(), getMyDocuments()]);
      setProfile(p.data.data.profile);
      setRequirements(r.data.data.requirements);
      setDocuments(d.data.data.documents);
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not load accreditation data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const docForName = (name) => documents.find((d) => d.documentType === name);

  const handleUpload = async (requirementId, file) => {
    await uploadEmployerDocument({ file, requirementId });
    setToast({ type: "success", message: "Document uploaded" });
    load();
  };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await submitForReview();
      setToast({ type: "success", message: "Submitted for review" });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not submit" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-96 max-w-3xl" />;
  if (!profile) {
    return (
      <div>
        <PageHeader title="Accreditation" />
        <Card><EmptyState icon={Building2} title="Complete your company profile first" message="You need a company profile before you can upload accreditation documents." /></Card>
      </div>
    );
  }

  const pending = profile.accreditationStatus === "Pending";

  return (
    <div>
      <PageHeader title="Accreditation" subtitle="Upload the required documents, then submit for coordinator review." action={<Badge status={profile.accreditationStatus} />} />
      {profile.accreditationRemarks && (
        <div className="bg-danger-light text-danger text-sm rounded-lg px-4 py-3 mb-4 max-w-3xl">Coordinator remarks: {profile.accreditationRemarks}</div>
      )}
      <Card className="max-w-3xl">
        <CardHeader title="Required documents" />
        <Table>
          <thead><tr><Th>Requirement</Th><Th>Status</Th><Th> </Th></tr></thead>
          <tbody>
            {requirements.map((r) => {
              const doc = docForName(r.name);
              return (
                <tr key={r.id}>
                  <Td className="font-medium">{r.name}</Td>
                  <Td><Badge status={doc?.status || "Missing"} /></Td>
                  <Td className="text-right">
                    {pending && <FileUpload label={doc ? "Replace" : "Upload"} onUpload={(file) => handleUpload(r.id, file)} />}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {pending && (
          <div className="flex justify-end mt-5">
            <Button icon={Send} loading={busy} onClick={handleSubmit}>Submit for review</Button>
          </div>
        )}
      </Card>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}