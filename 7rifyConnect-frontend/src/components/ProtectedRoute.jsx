import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";

export default function ProtectedRoute({ children, role }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setChecking(false), 200);
    return () => clearTimeout(t);
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-[40vh] text-slate-500">
        جارٍ التحقق…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = user?.role; // ← من الباك
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
