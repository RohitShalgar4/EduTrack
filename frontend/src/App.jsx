import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/Layout";
import LandingPage from "./components/LandingPage";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import DepartmentAdminDashboard from "./pages/admin/DepartmentAdminDashboard";

function App() {
  console.log("App - Rendering router"); // Debugging: Log when App renders

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          {/* Public Route: Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Route: Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes within MainLayout */}
          <Route element={<MainLayout />}>
            {/* Student Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Department Admin Dashboard */}
            <Route
              path="/department-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["department_admin"]}>
                  <DepartmentAdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Route: Redirect to Login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;