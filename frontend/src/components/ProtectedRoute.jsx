import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import PropTypes from 'prop-types';

function ProtectedRoute({ children, allowedRoles = ["super_admin", "department_admin", "student"] }) {
  const { authUser } = useSelector((state) => state.user);
  const isAuthenticated = !!authUser;
  const role = authUser?.role || "student"; // Default to student
  const isLoading = false; // Adjust if needed

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute - role:", role);
  console.log("ProtectedRoute - isLoading:", isLoading);
  console.log("ProtectedRoute - allowedRoles:", allowedRoles);

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    console.log("ProtectedRoute - User not authenticated. Redirecting to /login");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    console.log(`ProtectedRoute - User role (${role}) not allowed. Redirecting to /`);
    return <Navigate to="/" />;
  }

  console.log("ProtectedRoute - User authenticated and authorized. Rendering children.");
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
