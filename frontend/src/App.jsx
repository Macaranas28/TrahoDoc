import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Login from "./pages/public/Login.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentProfile from "./pages/student/Profile.jsx";
import StudentApplication from "./pages/student/Application.jsx";
import StudentDocuments from "./pages/student/Documents.jsx";
import StudentTracking from "./pages/student/Tracking.jsx";
import StudentNotifications from "./pages/student/Notifications.jsx";
import EmployerDashboard from "./pages/employer/Dashboard.jsx";
import EmployerProfile from "./pages/employer/CompanyProfile.jsx";
import EmployerAccreditation from "./pages/employer/Accreditation.jsx";
import EmployerApplications from "./pages/employer/Applications.jsx";
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
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/application" element={<StudentApplication />} />
            <Route path="/student/documents" element={<StudentDocuments />} />
            <Route path="/student/tracking" element={<StudentTracking />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allow={[ROLES.EMPLOYER]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/employer" element={<EmployerDashboard />} />
            <Route path="/employer/profile" element={<EmployerProfile />} />
            <Route path="/employer/accreditation" element={<EmployerAccreditation />} />
            <Route path="/employer/applications" element={<EmployerApplications />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}