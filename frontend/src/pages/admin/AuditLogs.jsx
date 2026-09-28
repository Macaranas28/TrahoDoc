import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ScrollText } from "lucide-react";
import { getAuditLogs, getAuditLogOptions } from "../../api/auditLogs.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { Table, Th, Td } from "../../components/ui/Table.jsx";
import { Select } from "../../components/ui/Input.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

const LIMIT = 25;

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [options, setOptions] = useState({ actions: [], modules: [] });
  const [filters, setFilters] = useState({ action: "", module: "", result: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogOptions().then((res) => setOptions(res.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: LIMIT, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
    getAuditLogs(params)
      .then((res) => {
        setLogs(res.data.data.logs);
        setTotal(res.data.data.total);
      })
      .finally(() => setLoading(false));
  }, [page, filters]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="A permanent, read-only record of security-sensitive actions." />

      <div className="grid sm:grid-cols-3 gap-3 mb-4 max-w-3xl">
        <Select value={filters.action} onChange={(e) => updateFilter("action", e.target.value)} aria-label="Filter by action">
          <option value="">All actions</option>
          {options.actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Select value={filters.module} onChange={(e) => updateFilter("module", e.target.value)} aria-label="Filter by module">
          <option value="">All modules</option>
          {options.modules.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
        <Select value={filters.result} onChange={(e) => updateFilter("result", e.target.value)} aria-label="Filter by result">
          <option value="">All results</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </Select>
      </div>

      <Card>
        {loading ? <Skeleton className="h-64" /> : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No matching events" message="Try clearing a filter." />
        ) : (
          <>
            <Table>
              <thead><tr><Th>Time</Th><Th>Actor</Th><Th>Action</Th><Th>Module</Th><Th>Result</Th><Th>Details</Th></tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <Td className="whitespace-nowrap text-muted">{new Date(l.timestamp).toLocaleString()}</Td>
                    <Td>{l.actor?.name || l.actorEmail || "—"}</Td>
                    <Td className="font-medium">{l.action}</Td>
                    <Td className="text-muted">{l.module}</Td>
                    <Td>
                      {l.result === "failure" ? (
                        <span className="inline-flex items-center gap-1 text-danger font-medium"><XCircle className="h-4 w-4" /> Failure</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-success font-medium"><CheckCircle2 className="h-4 w-4" /> Success</span>
                      )}
                    </Td>
                    <Td className="text-xs text-muted">{l.details}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}