import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES } from "../../utils/constants.js";

const LINKS_BY_ROLE = {
  [ROLES.STUDENT]: [
    { to: "/student", label: "Dashboard", end: true },
    { to: "/student/profile", label: "Profile" },
    { to: "/student/application", label: "OJT Application" },
    { to: "/student/documents", label: "Documents" },
    { to: "/student/tracking", label: "Tracking" },
    { to: "/student/notifications", label: "Notifications" },
  ],
  [ROLES.EMPLOYER]: [
    { to: "/employer", label: "Dashboard", end: true },
    { to: "/employer/profile", label: "Company Profile" },
    { to: "/employer/accreditation", label: "Accreditation" },
    { to: "/employer/applications", label: "Applications" },
  ],
  [ROLES.COORDINATOR]: [
    { to: "/coordinator", label: "Dashboard", end: true },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin", label: "Dashboard", end: true },
  ],
    [ROLES.COORDINATOR]: [
    { to: "/coordinator", label: "Dashboard", end: true },
    { to: "/coordinator/applications", label: "Student Applications" },
    { to: "/coordinator/documents", label: "Document Verification" },
    { to: "/coordinator/employers", label: "Employer Vetting" },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = LINKS_BY_ROLE[user?.role] || [];

  return (
    <nav style={{ width: 200, borderRight: "1px solid #e5e7eb", padding: "1rem" }}>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          style={({ isActive }) => ({
            display: "block", padding: "0.5rem 0", textDecoration: "none",
            color: isActive ? "#1d4ed8" : "#111", fontWeight: isActive ? 600 : 400,
          })}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}