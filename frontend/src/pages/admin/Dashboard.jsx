import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, Building2, ShieldCheck, Activity } from "lucide-react";
import { getDashboardSummary } from "../../api/dashboard.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

export default function Dashboard() {
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
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { userCounts } = summary;

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="System overview and recent activity." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Students" value={userCounts.student} icon={GraduationCap} tone="primary" to="/admin/users" />
        <StatCard label="Employers" value={userCounts.employer} icon={Building2} tone="info" to="/admin/users" />
        <StatCard label="Coordinators" value={userCounts.coordinator} icon={Users} tone="warning" to="/admin/users" />
        <StatCard label="Admins" value={userCounts.admin} icon={ShieldCheck} tone="success" to="/admin/users" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent activity"
            subtitle={`${summary.activityLast24h} events in the last 24 hours`}
            action={<Link to="/admin/audit-logs" className="text-sm text-primary font-medium hover:underline">View all</Link>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted border-b border-border">
                  <th className="py-2 pr-4 font-medium">Action</th>
                  <th className="py-2 pr-4 font-medium">Actor</th>
                  <th className="py-2 pr-4 font-medium">Result</th>
                  <th className="py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentActivity.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-medium">{a.action}</td>
                    <td className="py-3 pr-4 text-muted">{a.actor}</td>
                    <td className="py-3 pr-4">
                      <span className={a.result === "failure" ? "text-danger font-medium" : "text-success font-medium"}>{a.result}</span>
                    </td>
                    <td className="py-3 text-muted whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="System" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Total applications</dt><dd className="font-semibold">{summary.totalApplications}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Total employers</dt><dd className="font-semibold">{summary.totalEmployers}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Accredited employers</dt><dd className="font-semibold text-success">{summary.accreditedEmployers}</dd></div>
          </dl>
          <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
            <Activity className="h-4 w-4" /> Audit logs are read-only and cannot be edited.
          </div>
        </Card>
      </div>
    </div>
  );
}