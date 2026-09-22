const COLORS = {
  Draft: "#6b7280", Submitted: "#2563eb", "Under Review": "#d97706",
  "Needs Revision": "#d97706", Approved: "#16a34a", Rejected: "#dc2626",
  Withdrawn: "#6b7280", Pending: "#6b7280", Verified: "#16a34a", Missing: "#9ca3af",
  "Possible Modification": "#dc2626",
};

export default function StatusBadge({ status }) {
  const color = COLORS[status] || "#6b7280";
  return (
    <span style={{ background: color, color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: "0.8rem" }}>
      {status}
    </span>
  );
}