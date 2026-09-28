import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getCoordinatorApplications, getCoordinatorApplication } from "../../api/applications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";
import DocumentActions from "../../components/coordinator/DocumentActions.jsx";

export default function DocumentVerification() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = async () => {
    try {
      const res = await getCoordinatorApplications();
      const list = res.data.data.applications;
      const details = await Promise.all(list.map((a) => getCoordinatorApplication(a.id)));
      const flat = [];
      details.forEach(({ data }, i) => {
        const app = data.data.application;
        app.checklist.forEach((c) => {
          if (c.status === "Pending" || c.status === "Possible Modification") {
            flat.push({ ...c, applicationId: app.id, studentName: list[i].student?.name, employerName: app.employer.companyName });
          }
        });
      });
      setQueue(flat);
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not load the queue" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Document Verification" subtitle="Documents waiting for your review across all assigned applications." />
      <Card>
        {loading ? <Skeleton className="h-40" /> : queue.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing to verify" message="You're all caught up. New uploads will appear here." />
        ) : (
          <Table>
            <thead><tr><Th>Student</Th><Th>Employer</Th><Th>Document</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {queue.map((c) => (
                <tr key={c.document.id}>
                  <Td className="font-medium">{c.studentName}</Td>
                  <Td className="text-muted">{c.employerName}</Td>
                  <Td>
                    <p>{c.name}</p>
                    <p className="text-xs text-muted">{c.document.fileName}</p>
                  </Td>
                  <Td><Badge status={c.status} /></Td>
                  <Td><DocumentActions docId={c.document.id} docName={c.name} status={c.status} onDone={load} notify={setToast} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}