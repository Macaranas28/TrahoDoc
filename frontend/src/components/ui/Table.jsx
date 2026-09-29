export function Table({ children }) {
  return (
    <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
      <table className="w-full text-sm min-w-[560px]">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th className={`text-left text-xs font-medium uppercase tracking-wide text-muted py-2.5 px-3 border-b border-border whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`py-3 px-3 border-b border-border align-middle ${className}`}>{children}</td>;
}