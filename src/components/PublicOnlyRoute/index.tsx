import { Navigate, Outlet } from "react-router";

import { useAuth } from "../../contexts/AuthContext";
import { FullPageLoader } from "../FullPageLoader";

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
