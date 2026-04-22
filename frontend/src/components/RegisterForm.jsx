import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/register.css";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      await registerUser(formData);
      setMessage("Registration successful.");
      setMessageType("success");
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      setMessage("Error registering.");
      setMessageType("error");
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Register</h2>
        <p className="subtitle">Create your account</p>

        <form onSubmit={handleSubmit} className="register-form">
          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="phone" placeholder="Phone" onChange={handleChange} />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
          />

          <button type="submit">Register</button>
        </form>

        {message && (
          <p className={`form-message ${messageType}`}>{message}</p>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <p className="footer">2026 - All Rights Reserved</p>
      </div>

      <div className="image-section-register"></div>
    </div>
  );
}

export default RegisterForm;
