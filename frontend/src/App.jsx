import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDetails from './pages/teacher/StudentDetails';
import TeacherDetails from './pages/admin/TeacherDetails';
import DepartmentAdminDashboard from './pages/admin/DepartmentAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UpdatePasswordPopup from './components/UpdatePasswordPopup';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import MainLayout from './components/Layout';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={
          <ProtectedRoute>
            <UpdatePasswordPopupWrapper />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route element={<MainLayout />}>
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/department-admin/dashboard" element={
            <ProtectedRoute allowedRoles={['department_admin']}>
              <DepartmentAdminDashboard />
            </ProtectedRoute>
          } />

          {/* Details Routes */}
          <Route path="/student/:studentId" element={
            <ProtectedRoute allowedRoles={['super_admin', 'department_admin', 'teacher']}>
              <StudentDetails />
            </ProtectedRoute>
          } />
          <Route path="/teacher/:teacherId" element={
            <ProtectedRoute allowedRoles={['super_admin', 'department_admin']}>
              <TeacherDetails />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

// Wrapper component to handle navigation
function UpdatePasswordPopupWrapper() {
  const navigate = useNavigate();
  const { role } = useSelector(state => state.user.authUser);

  const handleClose = () => {
    // Navigate based on user role
    switch (role) {
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'teacher':
        navigate('/teacher/dashboard');
        break;
      case 'super_admin':
        navigate('/admin/dashboard');
        break;
      case 'department_admin':
        navigate('/department-admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return <UpdatePasswordPopup onClose={handleClose} />;
}

export default App;