import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-danger text-white hover:bg-red-700",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
};
const SIZES = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-base" };

export default function Button({ children, variant = "primary", size = "md", icon: Icon, loading, disabled, className = "", ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}