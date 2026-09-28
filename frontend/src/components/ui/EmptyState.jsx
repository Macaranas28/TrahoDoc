import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6" />
      </div>
      {title && <p className="text-base font-semibold text-slate-900">{title}</p>}
      {message && <p className="text-sm text-muted mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}