import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useAuth();

  const role = user?.role;

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but does not have permission
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;