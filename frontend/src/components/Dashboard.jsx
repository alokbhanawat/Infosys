import { jwtDecode } from "jwt-decode";
import "../styles/dashboard.css";

function Dashboard() {
  const token = localStorage.getItem("token");
  let user = null;

  try {
    if (token) {
      user = jwtDecode(token);
    }
  } catch (error) {
    console.log("Invalid token");
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-backdrop"></div>
      <div className="dashboard-layout simple-dashboard-layout">
        <div className="dashboard-card simple-dashboard-card">
          <h1>{user?.name || "User"}</h1>
          <p>{user?.sub || "Not available"}</p>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
