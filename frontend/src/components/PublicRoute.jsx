import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, getHomeRoute, isTokenValid } from "../utils/auth";

function PublicRoute() {
  if (isTokenValid()) {
    return <Navigate to={getHomeRoute(getCurrentUser())} replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
