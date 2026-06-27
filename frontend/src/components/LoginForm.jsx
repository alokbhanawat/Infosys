import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAppToast } from "../hooks/useAppToast";
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
  const toast = useAppToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((current) => ({ ...current, [e.target.name]: "" }));
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
      toast.error("Please correct the highlighted fields.");
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
      toast.success(res?.data?.message || "Login successful.");
      setTimeout(() => {
        navigate(getHomeRoute(user), { replace: true });
      }, 800);
    } catch (err) {
      const apiFieldErrors = err?.response?.data?.fieldErrors;
      const backendMessage = err?.response?.data?.message || "Invalid email or password.";
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
      }
      toast.error(apiFieldErrors ? "Please correct the highlighted fields." : backendMessage);
    }
  };

  return (
    <div className="auth-shell login-shell">
      <section className="auth-panel">
        <div className="auth-card">
          <img className="auth-logo" src="/brand-logo-full.png" alt="Infi Electronics" />
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to shop mobiles, laptops, headphones, smart TVs, and home appliances from your saved account.</p>

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

          <p className="auth-switch">New to Infi Electronics? <Link to="/register">Create an account</Link></p>

          <p className="footer">Infi Electronics online shopping</p>
        </div>
      </section>

      <section className="auth-hero login-hero">
        <div className="hero-orb hero-orb-one"></div>
        <div className="hero-orb hero-orb-two"></div>
        <div className="hero-content auth-hero-content">
          <span className="hero-kicker">Online electronics store</span>
          <h1>Shop premium tech deals from one clean account.</h1>
          <p className="hero-copy">Continue your electronics shopping journey with quick access to product details, cart checkout, delivery addresses, and order history.</p>
          <div className="auth-feature-stack">
            <article className="auth-feature-card">
              <strong>Electronics catalog</strong>
              <span>Browse mobiles, laptops, headphones, smart TVs, and refrigerators in one storefront.</span>
            </article>
            <article className="auth-feature-card">
              <strong>Fast shopping flow</strong>
              <span>Return to saved cart items, delivery details, and checkout without starting over.</span>
            </article>
          </div>
          <div className="auth-metrics">
            <article>
              <strong>500+</strong>
              <span>stock-ready items</span>
            </article>
            <article>
              <strong>5</strong>
              <span>electronics categories</span>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginForm;
