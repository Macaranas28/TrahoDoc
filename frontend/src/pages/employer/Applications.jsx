import { useEffect, useState } from "react";
import { Users, Check, X } from "lucide-react";
import { getEmployerApplications, respondToApplication } from "../../api/applications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Toast from "../../components/ui/Toast.jsx";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = () => getEmployerApplications().then((res) => {
    setApplications(res.data.data.applications);
    setLoading(false);
  });

  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    try {
      await respondToApplication(id, status);
      setToast({ type: "success", message: `Application ${status.toLowerCase()}` });
      load();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.message || "Could not respond" });
    }
  };

  return (
    <div>
      <PageHeader title="Applications" subtitle="Students who applied to your company. You can respond once a coordinator approves." />
      <Card>
        {loading ? <Skeleton className="h-40" /> : applications.length === 0 ? (
          <EmptyState icon={Users} title="No applications yet" message="Applications from students will appear here." />
        ) : (
          <Table>
            <thead><tr><Th>Student</Th><Th>Course</Th><Th>Status</Th><Th>Your response</Th><Th> </Th></tr></thead>
            <tbody>
              {applications.map((a) => {
                const canRespond = a.status === "Approved" && a.employerResponse?.status === "Pending";
                return (
                  <tr key={a.id}>
                    <Td className="font-medium">{a.student.name}</Td>
                    <Td className="text-muted">{a.student.course}</Td>
                    <Td><Badge status={a.status} /></Td>
                    <Td>{a.employerResponse?.status !== "Pending" ? <Badge status={a.employerResponse.status === "Accepted" ? "Approved" : "Rejected"} /> : <span className="text-muted">—</span>}</Td>
                    <Td className="text-right">
                      {canRespond && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" icon={Check} onClick={() => respond(a.id, "Accepted")}>Accept</Button>
                          <Button size="sm" variant="danger" icon={X} onClick={() => respond(a.id, "Declined")}>Decline</Button>
                        </div>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
      <Toast {...toast} onClose={() => setToast(null)} />
    </div>
  );
}