import { CheckCircle2, Clock, XCircle, AlertTriangle, Circle, Ban } from "lucide-react";

const CONFIG = {
  Draft: { color: "bg-slate-100 text-slate-700", icon: Circle },
  Submitted: { color: "bg-info-light text-info", icon: Clock },
  "Under Review": { color: "bg-warning-light text-warning", icon: Clock },
  "Needs Revision": { color: "bg-warning-light text-warning", icon: AlertTriangle },
  Approved: { color: "bg-success-light text-success", icon: CheckCircle2 },
  Accredited: { color: "bg-success-light text-success", icon: CheckCircle2 },
  Rejected: { color: "bg-danger-light text-danger", icon: XCircle },
  Withdrawn: { color: "bg-slate-100 text-slate-500", icon: Ban },
  Pending: { color: "bg-slate-100 text-slate-700", icon: Clock },
  Verified: { color: "bg-success-light text-success", icon: CheckCircle2 },
  Missing: { color: "bg-slate-100 text-slate-400", icon: Circle },
  "Possible Modification": { color: "bg-danger-light text-danger", icon: AlertTriangle },
  active: { color: "bg-success-light text-success", icon: CheckCircle2 },
  disabled: { color: "bg-danger-light text-danger", icon: Ban },
};

export default function Badge({ status }) {
  const cfg = CONFIG[status] || { color: "bg-slate-100 text-slate-700", icon: Circle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="h-3.5 w-3.5" /> {status}
    </span>
  );
}