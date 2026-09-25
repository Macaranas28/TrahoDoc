export default function Button({ children, variant = "primary", style, ...props }) {
  const variants = {
    primary: { background: "#1d4ed8", color: "#fff" },
    danger: { background: "#dc2626", color: "#fff" },
    secondary: { background: "#e5e7eb", color: "#111" },
  };
  return (
    <button
      {...props}
      style={{
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: 6,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        ...variants[variant],
        ...style, // allow callers to add/override specific properties, like marginRight above
      }}
    >
      {children}
    </button>
  );
}