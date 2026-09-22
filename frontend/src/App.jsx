import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Login from "./pages/public/Login.jsx";
import Dashboard from "./pages/student/Dashboard.jsx";
import Profile from "./pages/student/Profile.jsx";
import Application from "./pages/student/Application.jsx";
import Documents from "./pages/student/Documents.jsx";
import Tracking from "./pages/student/Tracking.jsx";
import Notifications from "./pages/student/Notifications.jsx";
import { ROLES } from "./utils/constants.js";

function Forbidden() { return <h1>403 – You don't have access to this page</h1>; }
function NotFound() { return <h1>404 – Page not found</h1>; }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/403" element={<Forbidden />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={[ROLES.STUDENT]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student" element={<Dashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/application" element={<Application />} />
            <Route path="/student/documents" element={<Documents />} />
            <Route path="/student/tracking" element={<Tracking />} />
            <Route path="/student/notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}