import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/Layout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LandingPage from "./components/LandingPage";

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

          {/* Protected Route: Student Dashboard (only accessible by 'student' role) */}
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Protected Route: Admin Dashboard (only accessible by 'admin' role) */}
          <Route element={<MainLayout />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback Route: Redirect to Login */}
          {/* <Route path="*" element={<Navigate to="/login" />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;