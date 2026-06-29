import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../../contexts/AuthContext";
import { FullPageLoader } from "../FullPageLoader";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
