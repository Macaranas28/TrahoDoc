import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const STYLES = {
  success: { bar: "border-l-success", icon: CheckCircle2, color: "text-success" },
  error: { bar: "border-l-danger", icon: XCircle, color: "text-danger" },
  info: { bar: "border-l-info", icon: Info, color: "text-info" },
};

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (!message) return null;
  const s = STYLES[type] || STYLES.info;
  const Icon = s.icon;

  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-50 max-w-sm bg-surface border border-border border-l-4 ${s.bar} rounded-lg shadow-lg p-4 flex items-start gap-3`}
    >
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${s.color}`} />
      <p className="text-sm text-slate-700 flex-1">{message}</p>
      <button onClick={onClose} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}