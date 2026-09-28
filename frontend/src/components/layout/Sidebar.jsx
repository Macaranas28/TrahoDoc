import { NavLink } from "react-router-dom";
import { X, LayoutDashboard, User, FileText, Folder, Building2, Bell, Users, ScrollText, ClipboardCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES } from "../../utils/constants.js";

const LINKS_BY_ROLE = {
  [ROLES.STUDENT]: [
    { to: "/student", label: "Dashboard", end: true, icon: LayoutDashboard },
    { to: "/student/profile", label: "Profile", icon: User },
    { to: "/student/application", label: "OJT Application", icon: FileText },
    { to: "/student/documents", label: "Documents", icon: Folder },
    { to: "/student/tracking", label: "Tracking", icon: ClipboardCheck },
    { to: "/student/notifications", label: "Notifications", icon: Bell },
  ],
  [ROLES.EMPLOYER]: [
    { to: "/employer", label: "Dashboard", end: true, icon: LayoutDashboard },
    { to: "/employer/profile", label: "Company Profile", icon: Building2 },
    { to: "/employer/accreditation", label: "Accreditation", icon: ClipboardCheck },
    { to: "/employer/applications", label: "Applications", icon: FileText },
  ],
  [ROLES.COORDINATOR]: [
    { to: "/coordinator", label: "Dashboard", end: true, icon: LayoutDashboard },
    { to: "/coordinator/applications", label: "Student Applications", icon: FileText },
    { to: "/coordinator/documents", label: "Document Verification", icon: Folder },
    { to: "/coordinator/employers", label: "Employer Vetting", icon: Building2 },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin", label: "Dashboard", end: true, icon: LayoutDashboard },
    { to: "/admin/users", label: "User Management", icon: Users },
    { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  ],
};

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const links = LINKS_BY_ROLE[user?.role] || [];

  const content = (
    <>
      <div className="flex items-center justify-between px-5 h-16 border-b border-border">
        <span className="font-bold text-lg text-slate-900">TrahoDoc</span>
        <button className="md:hidden text-slate-400" onClick={onCloseMobile}><X className="h-5 w-5" /></button>
      </div>
      <nav className="p-3 space-y-0.5">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-light text-primary" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {l.label}
            </NavLink>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-surface">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface flex flex-col">{content}</aside>
        </div>
      )}
    </>
  );
}