import { meRequest } from "../../api/auth.api.js";

// Clicking "Stay logged in" makes a real request, which the backend's authenticate
// middleware uses to reissue a fresh 15-minute cookie (Phase 7's sliding timeout).
export default function IdleWarning({ show, onDismiss }) {
  if (!show) return null;

  const stayLoggedIn = async () => {
    try {
      await meRequest();
    } finally {
      onDismiss();
    }
  };

  return (
    <div
      style={{
        position: "fixed", bottom: 20, right: 20, background: "#1f2937", color: "#fff",
        padding: "1rem", borderRadius: 8, maxWidth: 320, zIndex: 1000,
      }}
    >
      <p style={{ margin: 0, marginBottom: "0.75rem" }}>
        You've been inactive for a while. You'll be logged out soon for security.
      </p>
      <button
        onClick={stayLoggedIn}
        style={{ background: "#1d4ed8", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 6, cursor: "pointer" }}
      >
        Stay logged in
      </button>
    </div>
  );
}