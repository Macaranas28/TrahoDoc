import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!message) return null;
  const bg = type === "error" ? "#dc2626" : type === "success" ? "#16a34a" : "#1f2937";

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, background: bg, color: "#fff", padding: "0.75rem 1rem", borderRadius: 6, maxWidth: 320 }}>
      {message}
    </div>
  );
}