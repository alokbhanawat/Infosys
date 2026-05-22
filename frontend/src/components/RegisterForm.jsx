import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { getRequiredFieldError, validateEmail, validatePhone } from "../utils/authValidation";
import "../styles/register.css";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    adminKey: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setFieldErrors((current) => {
      const nextErrors = { ...current };

      if (name === "email" || name === "phone") {
        const validator = name === "email" ? validateEmail : validatePhone;
        const fieldError = validator(value);
        if (fieldError) {
          nextErrors[name] = fieldError;
        } else {
          delete nextErrors[name];
        }
      } else if (current[name]) {
        delete nextErrors[name];
      }

      return nextErrors;
    });

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name !== "email" && name !== "phone") {
      return;
    }

    const fieldError = name === "email" ? validateEmail(value) : validatePhone(value);
    setFieldErrors((current) => ({
      ...current,
      [name]: fieldError,
    }));
  };

  const validateForm = () => {
    const errors = {
      name: getRequiredFieldError("Name", formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: getRequiredFieldError("Password", formData.password),
      confirmPassword: getRequiredFieldError("Confirm password", formData.confirmPassword),
    };

    if (!errors.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        adminKey: formData.adminKey.trim(),
      };

      const res = await registerUser(payload);
      const role = res?.data?.role || "USER";

      setMessage(`Registration successful. Role assigned: ${role}.`);
      setMessageType("success");
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      const apiFieldErrors = err?.response?.data?.fieldErrors;
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
        setMessage("Please correct the highlighted fields.");
      } else {
        setMessage(err?.response?.data?.message || "Error registering.");
      }
      setMessageType("error");
    }
  };

  return (
    <div className="auth-shell register-shell">
      <section className="auth-hero register-hero">
        <div className="hero-orb hero-orb-one"></div>
        <div className="hero-orb hero-orb-two"></div>
        <div className="hero-content auth-hero-content">
          <span className="hero-kicker">Create account</span>
          <h1>Create your account and shop your favorite picks with a faster, smoother checkout.</h1>
          <p className="hero-copy">Join our store to save your details, follow every order update, and enjoy a simple ecommerce experience built for repeat shopping.</p>
          <div className="auth-showcase-grid">
            <article>
              <span>Profile</span>
              <strong>Save delivery details for quicker purchases</strong>
            </article>
            <article>
              <span>Orders</span>
              <strong>Track purchases and view order history anytime</strong>
            </article>
            <article>
              <span>Benefits</span>
              <strong>Keep your wishlist, cart, and checkout ready to go</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-badge-row">
            <span className="auth-badge">New account</span>
            <span className="auth-dot"></span>
            <span className="auth-badge auth-badge-soft">Secure setup</span>
          </div>
          <h2>Create account</h2>
          <p className="subtitle">Create your account to discover products, place orders faster, and come back to a store experience that remembers you.</p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-grid">
              <div className="field-group">
                <input
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={fieldErrors.name ? "input-error" : ""}
                />
                {fieldErrors.name ? <span className="field-error">{fieldErrors.name}</span> : null}
              </div>
              <div className="field-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldErrors.email ? "input-error" : ""}
                />
                {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
              </div>
            </div>
            <div className="field-group">
              <input
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.phone ? "input-error" : ""}
              />
              {fieldErrors.phone ? <span className="field-error">{fieldErrors.phone}</span> : null}
            </div>
            <div className="field-group">
              <input
                name="adminKey"
                placeholder="Admin key (optional)"
                value={formData.adminKey}
                onChange={handleChange}
              />
            </div>
            <div className="field-group">
              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                className={fieldErrors.password ? "input-error" : ""}
              />
              {fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
            </div>
            <div className="field-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={fieldErrors.confirmPassword ? "input-error" : ""}
              />
              {fieldErrors.confirmPassword ? <span className="field-error">{fieldErrors.confirmPassword}</span> : null}
            </div>

            <button type="submit">Create account</button>
          </form>

          {message && (
            <p className={`form-message ${messageType}`}>{message}</p>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>

          <p className="footer">2026 - All Rights Reserved</p>
        </div>
      </section>
    </div>
  );
}

export default RegisterForm;
