import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/hooks/useAuth";

export default function ProtectedArtisan() {
  const { data: me, isLoading } = useMe();

  if (isLoading) return null;
  if (!me) return <Navigate to="/login" replace />;

  if (me.role === "artisan" || me.role === "technicien") {
    const isVerified = me?.artisan?.isVerified ?? me?.artisan?.is_verified ?? me?.isVerified ?? me?.is_verified;
    if (Number(isVerified) !== 1) {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  return <Outlet />;
}
