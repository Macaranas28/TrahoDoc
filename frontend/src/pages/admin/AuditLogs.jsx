import { useEffect, useState } from "react";
import { getAuditLogs, getAuditLogOptions } from "../../api/auditLogs.api.js";
import Spinner from "../../components/common/Spinner.jsx";
import Button from "../../components/common/Button.jsx";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [options, setOptions] = useState({ actions: [], modules: [] });
  const [filters, setFilters] = useState({ action: "", module: "", result: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 25;

  useEffect(() => {
    getAuditLogOptions().then((res) => setOptions(res.data.data));
  }, []);

  const load = () => {
    setLoading(true);
    const params = { page, limit, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
    getAuditLogs(params).then((res) => {
      setLogs(res.data.data.logs);
      setTotal(res.data.data.total);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [page, filters]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <h1>Audit Logs</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select value={filters.action} onChange={(e) => updateFilter("action", e.target.value)} style={{ padding: "0.4rem" }}>
          <option value="">All actions</option>
          {options.actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filters.module} onChange={(e) => updateFilter("module", e.target.value)} style={{ padding: "0.4rem" }}>
          <option value="">All modules</option>
          {options.modules.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filters.result} onChange={(e) => updateFilter("result", e.target.value)} style={{ padding: "0.4rem" }}>
          <option value="">All results</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      {loading ? <Spinner /> : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Time</th><th align="left">Actor</th><th align="left">Action</th>
                <th align="left">Module</th><th align="left">Result</th><th align="left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>{l.actor?.name || l.actorEmail || "—"}</td>
                  <td>{l.action}</td>
                  <td>{l.module}</td>
                  <td style={{ color: l.result === "failure" ? "#dc2626" : "#16a34a" }}>{l.result}</td>
                  <td style={{ color: "#6b7280", fontSize: "0.85rem" }}>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}