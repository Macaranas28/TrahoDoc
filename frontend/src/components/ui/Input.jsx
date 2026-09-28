export function Field({ label, error, required, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Input({ error, className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        ${error ? "border-danger" : "border-border"} ${className}`}
      {...props}
    />
  );
}

export function Select({ error, className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        ${error ? "border-danger" : "border-border"} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}