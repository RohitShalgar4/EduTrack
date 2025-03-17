import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import PropTypes from 'prop-types';

function ProtectedRoute({ children, allowedRoles = ['student', 'teacher', 'super_admin', 'department_admin'] }) {
  const { authUser } = useSelector((state) => state.user);
  const isAuthenticated = !!authUser;
  const role = authUser?.role;

  console.log("ProtectedRoute - Auth Data:", {
    isAuthenticated,
    role,
    allowedRoles,
    authUser
  });

  if (!isAuthenticated) {
    console.log("ProtectedRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return children;
  }

  console.log("ProtectedRoute - Unauthorized role, redirecting to home");
  return <Navigate to="/" />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
