export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th className={`text-left text-xs font-medium uppercase tracking-wide text-muted py-2.5 px-3 border-b border-border ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`py-3 px-3 border-b border-border align-middle ${className}`}>{children}</td>;
}