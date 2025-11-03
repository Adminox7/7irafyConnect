import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";
import { Api } from "../api/endpoints";

export default function ProtectedRoute({ children, role, allowPending = false }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const [checking, setChecking] = useState(true);
  const [techGate, setTechGate] = useState(role === "technicien" ? "checking" : "ok");
  useEffect(() => {
    const t = setTimeout(() => setChecking(false), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (role !== "technicien" || !token) {
      setTechGate("ok");
      return;
    }

    let cancelled = false;
    setTechGate("checking");

    Api.checkTechnicianGate()
      .then(() => {
        if (!cancelled) setTechGate("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 403 && err?.data?.status === "pending_verification") {
          setTechGate("pending");
        } else {
          setTechGate("ok");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [role, token]);

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

  if (role === "technicien" && techGate === "pending") {
    if (allowPending) {
      return children;
    }
    return <Navigate to="/pending-verification" replace />;
  }

  if (role === "technicien" && techGate === "checking") {
    return (
      <div className="flex items-center justify-center h-[40vh] text-slate-500">
        جارٍ التحقق من حالة الحساب…
      </div>
    );
  }

  return children;
}
