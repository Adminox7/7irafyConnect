import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

export default function ProtectedRoute({ children, role }) {
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.role);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
