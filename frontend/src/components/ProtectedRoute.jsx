import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  clearStoredToken,
  getCurrentUser,
  getHomeRoute,
  isTokenValid,
} from "../utils/auth";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const isAuthenticated = isTokenValid();
  const user = getCurrentUser();

  if (!isAuthenticated) {
    clearStoredToken();

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
