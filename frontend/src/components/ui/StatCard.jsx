import { Link } from "react-router-dom";

const TONES = {
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-info-light text-info",
};

export default function StatCard({ label, value, icon: Icon, tone = "primary", to }) {
  const body = (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-5 flex items-center gap-4 hover:border-primary/40 transition-colors">
      <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${TONES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-sm text-muted mt-1">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}