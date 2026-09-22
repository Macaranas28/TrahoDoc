import { useEffect, useState } from "react";
import { getMyApplications, getApplication } from "../../api/applications.api.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";

export default function Tracking() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications().then(async (res) => {
      const list = res.data.data.applications;
      if (list.length === 0) return setLoading(false);
      const detail = await getApplication(list[0].id); // most recent first
      setApplication(detail.data.data.application);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  if (!application) return <EmptyState message="You have no applications yet." />;

  return (
    <div>
      <h1>Application Tracking</h1>
      <p><strong>{application.employer.companyName}</strong> <StatusBadge status={application.status} /></p>

      <h3>Timeline</h3>
      <ul>
        {application.timeline.map((t, i) => (
          <li key={i}>
            <StatusBadge status={t.status} /> — {new Date(t.changedAt).toLocaleString()}
            {t.remarks && <div style={{ color: "#6b7280" }}>{t.remarks}</div>}
          </li>
        ))}
      </ul>

      <h3>Document Checklist</h3>
      <ul>
        {application.checklist.map((c) => (
          <li key={c.requirementId}>
            {c.name}: <StatusBadge status={c.status} />
            {c.document?.remarks && <div style={{ color: "#dc2626" }}>{c.document.remarks}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}