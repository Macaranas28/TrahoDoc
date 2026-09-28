import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Folder, CheckCircle2, Bell, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyApplications, getApplication } from "../../api/applications.api.js";
import { getNotifications } from "../../api/notifications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

// Tells the student the single most useful next step
const nextStep = (app, counts) => {
  if (!app) return { text: "Start by choosing an accredited employer and creating your OJT application.", to: "/student/application", label: "Create Application" };
  if (["Draft", "Needs Revision"].includes(app.status)) {
    return counts.missing > 0
      ? { text: `You still have ${counts.missing} document(s) to upload before you can submit.`, to: "/student/tracking", label: "Upload Documents" }
      : { text: "All documents uploaded. You can submit your application now.", to: "/student/application", label: "Submit Application" };
  }
  if (app.status === "Approved") return { text: "Your application was approved. Wait for the employer's response.", to: "/student/tracking", label: "View Tracking" };
  return { text: "Your application is being reviewed. We'll notify you of any update.", to: "/student/tracking", label: "View Tracking" };
};

export default function Dashboard() {
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [detail, setDetail] = useState(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [appsRes, notifRes] = await Promise.all([getMyApplications(), getNotifications({ limit: 1 })]);
        const apps = appsRes.data.data.applications;
        const active = apps.find((a) => !["Withdrawn", "Rejected"].includes(a.status)) || apps[0] || null;
        setApplication(active);
        setUnread(notifRes.data.data.unreadCount);
        if (active) setDetail((await getApplication(active.id)).data.data.application);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  const checklist = detail?.checklist || [];
  const counts = {
    total: checklist.length,
    uploaded: checklist.filter((c) => c.status !== "Missing").length,
    verified: checklist.filter((c) => c.status === "Verified").length,
    missing: checklist.filter((c) => c.status === "Missing").length,
  };
  const step = nextStep(application, counts);

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name?.split(" ")[0]}`} subtitle="Here's where your OJT application stands." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Applications" value={application ? 1 : 0} icon={FileText} tone="primary" to="/student/application" />
        <StatCard label="Documents uploaded" value={`${counts.uploaded}/${counts.total}`} icon={Folder} tone="info" to="/student/tracking" />
        <StatCard label="Verified" value={counts.verified} icon={CheckCircle2} tone="success" to="/student/tracking" />
        <StatCard label="Unread notifications" value={unread} icon={Bell} tone="warning" to="/student/notifications" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Current OJT Application" />
          {application ? (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm text-muted">Employer</p>
                <p className="text-lg font-semibold">{application.employer.companyName}</p>
              </div>
              <Badge status={application.status} />
            </div>
          ) : (
            <p className="text-sm text-muted">You haven't created an application yet.</p>
          )}
        </Card>

        <Card className="bg-primary-light border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Next step</p>
          <p className="text-sm text-slate-700 mb-4">{step.text}</p>
          <Link to={step.to}>
            <Button icon={ArrowRight} size="sm">{step.label}</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}