import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import IdleWarning from "./IdleWarning.jsx";
import { useIdleTimer } from "../../hooks/useIdleTimer.js";

export default function DashboardLayout() {
  const { showWarning, dismissWarning } = useIdleTimer(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      <IdleWarning show={showWarning} onDismiss={dismissWarning} />
    </div>
  );
}