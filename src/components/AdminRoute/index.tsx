import { Navigate, Outlet } from "react-router";

import { useAuth } from "../../contexts/AuthContext";
import { FullPageLoader } from "../FullPageLoader";

export function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
