import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { getCoordinatorApplications } from "../../api/applications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCoordinatorApplications()
      .then((res) => setApplications(res.data.data.applications))
      .catch((err) => setError(err.response?.data?.message || "Could not load applications"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Student Applications" subtitle="Applications assigned to you for review." />
      <Card>
        {loading ? <Skeleton className="h-40" /> : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : applications.length === 0 ? (
          <EmptyState icon={FileText} title="No applications assigned" message="An administrator assigns applications to coordinators. They will appear here." />
        ) : (
          <Table>
            <thead><tr><Th>Student</Th><Th>Employer</Th><Th>Status</Th><Th> </Th></tr></thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id}>
                  <Td>
                    <p className="font-medium">{a.student?.name}</p>
                    <p className="text-xs text-muted">{a.student?.course}</p>
                  </Td>
                  <Td>{a.employer?.companyName}</Td>
                  <Td><Badge status={a.status} /></Td>
                  <Td className="text-right"><Link to={`/coordinator/applications/${a.id}`} className="text-primary font-medium hover:underline">Review</Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}