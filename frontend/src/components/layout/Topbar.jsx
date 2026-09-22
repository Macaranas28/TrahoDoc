import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../common/Button.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb" }}>
      <strong>TrahoDoc</strong>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>{user?.name}</span>
        <Button variant="secondary" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}