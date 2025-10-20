import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";

export default function ProtectedRoute({ children, role }) {
  const token = useAuthStore((s) => s.token);
  const userRole = useAuthStore((s) => s.role);
  const location = useLocation();

  // 🕒 نزيدو حالة بسيطة باش مانرديوش قبل ما يتحمل الـstore
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // كنستنا نصف ثانية باش Zustand يقرى localStorage مزيان
    const t = setTimeout(() => setChecking(false), 300);
    return () => clearTimeout(t);
  }, []);

  if (checking) {
    // ممكن دير هنا loading صغير
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        جارٍ التحقق...
      </div>
    );
  }

  // 🚫 ما كاينش توكن
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🚫 الدور ما مطابقش (غير إلى كان role مطلوب)
  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ كلشي مزيان
  return children;
}
