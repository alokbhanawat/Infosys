import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { clearStoredToken, getCurrentUser } from "../utils/auth";

function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-backdrop"></div>
      <div className="dashboard-layout simple-dashboard-layout">
        <div className="dashboard-card simple-dashboard-card">
          <h1>{user?.name || "User"}</h1>
          <p>{user?.sub || "Not available"}</p>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
