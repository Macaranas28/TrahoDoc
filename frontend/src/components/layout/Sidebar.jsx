import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/student", label: "Dashboard", end: true },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/application", label: "OJT Application" },
  { to: "/student/documents", label: "Documents" },
  { to: "/student/tracking", label: "Tracking" },
  { to: "/student/notifications", label: "Notifications" },
];

export default function Sidebar() {
  return (
    <nav style={{ width: 200, borderRight: "1px solid #e5e7eb", padding: "1rem" }}>
      {LINKS.map((l) => (
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