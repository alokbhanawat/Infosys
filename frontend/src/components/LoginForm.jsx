import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import {
  clearStoredToken,
  getCurrentUser,
  getHomeRoute,
  setStoredSession,
} from "../utils/auth";
import { getRequiredFieldError, validateEmail } from "../utils/authValidation";
import "../styles/login.css";

function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((current) => ({ ...current, [e.target.name]: "" }));
    }
    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: getRequiredFieldError("Password", formData.password),
    };

    return Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("Please correct the highlighted fields.");
      setMessageType("error");
      return;
    }

    try {
      const res = await loginUser(formData);
      const token = res?.data?.token;

      if (!token) {
        throw new Error("Token missing in response");
      }

      clearStoredToken();
      setStoredSession({
        token,
        userId: res?.data?.userId ?? res?.data?.id,
        role: res?.data?.role,
      });
      const user = getCurrentUser();
      setMessage("Login successful.");
      setMessageType("success");
      setTimeout(() => {
        navigate(getHomeRoute(user), { replace: true });
      }, 800);
    } catch (err) {
      const apiFieldErrors = err?.response?.data?.fieldErrors;
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
        setMessage("Please correct the highlighted fields.");
      } else {
        setMessage(err?.response?.data?.message || "Invalid email or password.");
      }
      setMessageType("error");
    }
  };

  return (
    <div className="auth-shell login-shell">
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-badge-row">
            <span className="auth-badge">Member access</span>
            <span className="auth-dot"></span>
            <span className="auth-badge auth-badge-soft">Fast checkout</span>
          </div>
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to continue browsing collections, saved carts, and recent orders.</p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="field-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={fieldErrors.email ? "input-error" : ""}
              />
              {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
            </div>

            <div className="field-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={fieldErrors.password ? "input-error" : ""}
              />
              {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
            </div>

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
      </section>

      <section className="auth-hero login-hero">
        <div className="hero-orb hero-orb-one"></div>
        <div className="hero-orb hero-orb-two"></div>
        <div className="hero-content auth-hero-content">
          <span className="hero-kicker">Login to shop</span>
          <h1>Step back into your ecommerce account and continue shopping products.</h1>
          <p className="hero-copy">Sign in to revisit your cart, check recent orders, and move through the product catalog without losing your flow.</p>
          <div className="auth-feature-stack">
            <article className="auth-feature-card">
              <strong>Product access</strong>
              <span>Open the catalog and jump straight into the products you want to browse.</span>
            </article>
            <article className="auth-feature-card">
              <strong>Account continuity</strong>
              <span>Return to your cart, profile, and orders with a single login flow.</span>
            </article>
          </div>
          <div className="auth-metrics">
            <article>
              <strong>Saved cart</strong>
              <span>resume anytime</span>
            </article>
            <article>
              <strong>Quick login</strong>
              <span>shop without delay</span>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginForm;
