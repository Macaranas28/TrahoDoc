import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../ui/Button.jsx";

export default function Topbar({ onOpenMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 md:px-6">
      <button className="md:hidden text-slate-500" onClick={onOpenMobile}>
        <Menu className="h-6 w-6" />
      </button>
      <div className="hidden md:block" />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((s) => !s)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user?.name}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}