import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "../styles/login.css";

function LoginForm() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(formData);

      // ✅ STORE TOKEN
      localStorage.setItem("token", res.data);

      alert("Login Successful");
      navigate("/dashboard");

    } catch (err) {
      alert("Invalid email or password");
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

        <p className="footer">2026 – All Rights Reserved</p>
      </div>

      <div className="image-section-login"></div>

    </div>
  );
}

export default LoginForm;