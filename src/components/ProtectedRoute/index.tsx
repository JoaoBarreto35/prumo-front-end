import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";

import { useAuth } from "../../contexts/AuthContext";
import { FullPageLoader } from "../FullPageLoader";


export function ProtectedRoute() {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname
            + location.search,
        }}
      />
    );
  }

  if (
    user?.must_change_password
    && location.pathname
      !== "/change-temporary-password"
  ) {
    return (
      <Navigate
        to="/change-temporary-password"
        replace
      />
    );
  }

  if (
    !user?.must_change_password
    && location.pathname
      === "/change-temporary-password"
  ) {
    return (
      <Navigate
        to="/home"
        replace
      />
    );
  }

  return <Outlet />;
}
