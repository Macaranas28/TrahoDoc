import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Folder, Building2, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDashboardSummary } from "../../api/dashboard.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary().then((res) => setSummary(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  // The work queue: only rows that actually need attention are shown
  const queue = [
    { label: "Applications waiting for review", count: summary.pendingApplications, to: "/coordinator/applications", icon: FileText },
    { label: "Documents waiting for verification", count: summary.pendingDocumentVerification, to: "/coordinator/documents", icon: Folder },
    { label: "Employers waiting for accreditation", count: summary.employerAccreditationRequests, to: "/coordinator/employers", icon: Building2 },
    { label: "Employers with open risk indicators", count: summary.riskIndicators, to: "/coordinator/employers", icon: AlertTriangle },
  ].filter((q) => q.count > 0);

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name?.split(" ")[0]}`} subtitle="Here's what needs your attention." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending applications" value={summary.pendingApplications} icon={FileText} tone="primary" to="/coordinator/applications" />
        <StatCard label="Documents to verify" value={summary.pendingDocumentVerification} icon={Folder} tone="warning" to="/coordinator/documents" />
        <StatCard label="Accreditation requests" value={summary.employerAccreditationRequests} icon={Building2} tone="info" to="/coordinator/employers" />
        <StatCard label="Risk indicators" value={summary.riskIndicators} icon={AlertTriangle} tone={summary.riskIndicators ? "danger" : "success"} to="/coordinator/employers" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Work queue" subtitle="Items that need a decision from you" />
          {queue.length === 0 ? (
            <p className="text-sm text-muted">You're all caught up. Nothing is waiting for review.</p>
          ) : (
            <ul className="divide-y divide-border">
              {queue.map((q) => {
                const Icon = q.icon;
                return (
                  <li key={q.label}>
                    <Link to={q.to} className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg">
                      <span className="flex items-center gap-3 text-sm">
                        <Icon className="h-4 w-4 text-muted" />
                        {q.label}
                      </span>
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {q.count} <ArrowRight className="h-4 w-4 text-slate-400" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Your decisions" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Approved applications</dt><dd className="font-semibold text-success">{summary.stats.approvedApplications}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Rejected applications</dt><dd className="font-semibold text-danger">{summary.stats.rejectedApplications}</dd></div>
          </dl>
          <p className="text-xs text-muted mt-4">Risk indicators are prompts to look closer. They are not proof of a problem.</p>
        </Card>
      </div>
    </div>
  );
}