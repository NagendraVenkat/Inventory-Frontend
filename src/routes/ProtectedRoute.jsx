import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;