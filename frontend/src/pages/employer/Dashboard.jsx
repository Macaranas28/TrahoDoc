import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, FileText, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyEmployerProfile } from "../../api/employers.api.js";
import { getEmployerApplications } from "../../api/applications.api.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { Card, CardHeader } from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyEmployerProfile(), getEmployerApplications()])
      .then(([p, a]) => {
        setProfile(p.data.data.profile);
        setApplications(a.data.data.applications);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  const awaiting = applications.filter((a) => a.status === "Approved" && a.employerResponse?.status === "Pending").length;
  const status = profile?.accreditationStatus;

  let next;
  if (!profile) next = { text: "Create your company profile to begin accreditation.", to: "/employer/profile", label: "Create Profile" };
  else if (status === "Pending") next = { text: "Upload your required documents, then submit for review.", to: "/employer/accreditation", label: "Go to Accreditation" };
  else if (status === "Under Review") next = { text: "A coordinator is reviewing your documents. We'll notify you of the result.", to: "/employer/accreditation", label: "View Status" };
  else if (status === "Rejected") next = { text: "Your accreditation was rejected. Review the remarks and resubmit.", to: "/employer/accreditation", label: "View Remarks" };
  else if (awaiting > 0) next = { text: `${awaiting} approved application(s) are waiting for your response.`, to: "/employer/applications", label: "Respond Now" };
  else next = { text: "You're accredited. Approved student applications will appear here.", to: "/employer/applications", label: "View Applications" };

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name?.split(" ")[0]}`} subtitle={profile?.companyName || "Set up your company profile to get started."} />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Accreditation"
          value={status || "Not started"}
          icon={ClipboardCheck}
          tone={status === "Accredited" ? "success" : "warning"}
          to="/employer/accreditation"
        />
        <StatCard label="Applications" value={applications.length} icon={FileText} tone="primary" to="/employer/applications" />
        <StatCard label="Awaiting your response" value={awaiting} icon={Clock} tone={awaiting ? "danger" : "info"} to="/employer/applications" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Applications" />
          {applications.length === 0 ? (
            <p className="text-sm text-muted">No applications yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {applications.slice(0, 5).map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.student.name}</p>
                    <p className="text-xs text-muted">{a.student.course}</p>
                  </div>
                  <Badge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="bg-primary-light border-primary/20">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Next step</p>
          <p className="text-sm text-slate-700 mb-4">{next.text}</p>
          <Link to={next.to}><Button icon={ArrowRight} size="sm">{next.label}</Button></Link>
        </Card>
      </div>
    </div>
  );
}