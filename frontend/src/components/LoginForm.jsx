import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "../styles/login.css";

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(formData);

      localStorage.setItem("token", res.data);
      setMessage("Login successful.");
      setMessageType("success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setMessage("Invalid email or password.");
      setMessageType("error");
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Login</h2>
        <p className="subtitle">Welcome back</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button type="submit">Login</button>
        </form>

        {message && (
          <p className={`form-message ${messageType}`}>{message}</p>
        )}

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>

        <p className="footer">2026 - All Rights Reserved</p>
      </div>

      <div className="image-section-login"></div>
    </div>
  );
}

export default LoginForm;
