function Dashboard() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Email: {user?.email}</p>

      <button onClick={() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;