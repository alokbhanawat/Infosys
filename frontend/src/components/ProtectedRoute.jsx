import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearStoredToken, isTokenValid } from "../utils/auth";

function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = isTokenValid();

  if (!isAuthenticated) {
    clearStoredToken();

    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
