import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import IdleWarning from "./IdleWarning.jsx";
import { useIdleTimer } from "../../hooks/useIdleTimer.js";

export default function DashboardLayout() {
  const { showWarning, dismissWarning } = useIdleTimer(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Topbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
      <IdleWarning show={showWarning} onDismiss={dismissWarning} />
    </div>
  );
}