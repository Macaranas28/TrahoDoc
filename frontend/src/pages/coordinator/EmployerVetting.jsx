import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, AlertTriangle } from "lucide-react";
import { getCoordinatorEmployers } from "../../api/employers.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

const FILTERS = ["", "Under Review", "Pending", "Accredited", "Rejected"];

export default function EmployerVetting() {
  const [employers, setEmployers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCoordinatorEmployers(filter).then((res) => setEmployers(res.data.data.employers)).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <PageHeader title="Employer Vetting" subtitle="Review company information and accreditation documents." />
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Button key={f || "all"} size="sm" variant={filter === f ? "primary" : "secondary"} onClick={() => setFilter(f)}>{f || "All"}</Button>
        ))}
      </div>
      <Card>
        {loading ? <Skeleton className="h-40" /> : employers.length === 0 ? (
          <EmptyState icon={Building2} title="No employers found" message="Try a different filter." />
        ) : (
          <Table>
            <thead><tr><Th>Company</Th><Th>Status</Th><Th>Risk indicators</Th><Th> </Th></tr></thead>
            <tbody>
              {employers.map((e) => (
                <tr key={e.id}>
                  <Td>
                    <p className="font-medium">{e.companyName}</p>
                    <p className="text-xs text-muted">{e.email}</p>
                  </Td>
                  <Td><Badge status={e.accreditationStatus} /></Td>
                  <Td>
                    {e.openFlagCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning-light px-2.5 py-1 rounded-full">
                        <AlertTriangle className="h-3.5 w-3.5" /> {e.openFlagCount} to review
                      </span>
                    ) : <span className="text-muted">None</span>}
                  </Td>
                  <Td className="text-right"><Link to={`/coordinator/employers/${e.id}`} className="text-primary font-medium hover:underline">Review</Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}