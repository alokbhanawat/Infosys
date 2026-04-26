import { Navigate, Outlet } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

function PublicRoute() {
  if (isTokenValid()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
