import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAppToast } from "../hooks/useAppToast";
import { getRequiredFieldError, validateEmail, validatePhone } from "../utils/authValidation";
import "../styles/register.css";

function RegisterForm() {
  const navigate = useNavigate();
  const toast = useAppToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    adminKey: "",
    password: "",
    confirmPassword: "",
  });
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
      toast.error("Please correct the highlighted fields.");
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
      const successMessage = res?.data?.message || `Registration successful. Role assigned: ${role}.`;

      toast.success(successMessage);
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      const apiFieldErrors = err?.response?.data?.fieldErrors;
      const backendMessage = err?.response?.data?.message || "Error registering.";
      if (apiFieldErrors) {
        setFieldErrors(apiFieldErrors);
      }
      toast.error(apiFieldErrors ? "Please correct the highlighted fields." : backendMessage);
    }
  };

  return (
    <div className="auth-shell register-shell">
      <section className="auth-hero register-hero">
        <div className="hero-orb hero-orb-one"></div>
        <div className="hero-orb hero-orb-two"></div>
        <div className="hero-content auth-hero-content">
          <span className="hero-kicker">Join Infi Electronics</span>
          <h1>Create your account for smarter online electronics shopping.</h1>
          <p className="hero-copy">Save your profile, manage delivery addresses, and shop tech products with a clean checkout built for mobiles, laptops, TVs, audio, and appliances.</p>
          <div className="auth-showcase-grid">
            <article>
              <span>Mobiles</span>
              <strong>Discover everyday phones with sharp displays and smooth performance</strong>
            </article>
            <article>
              <span>Laptops & TVs</span>
              <strong>Shop work devices and entertainment screens from the same account</strong>
            </article>
            <article>
              <span>Checkout</span>
              <strong>Keep cart, address, payment, and order tracking ready for every purchase</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-badge-row">
            <span className="auth-badge">Electronics account</span>
            <span className="auth-dot"></span>
            <span className="auth-badge auth-badge-soft">Fast buying</span>
          </div>
          <h2>Create account</h2>
          <p className="subtitle">Create your Infi Electronics account to browse tech products, save delivery details, and place orders faster.</p>

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

          <p className="auth-switch">Already shopping with us? <Link to="/login">Login</Link></p>

          <p className="footer">Infi Electronics online shopping</p>
        </div>
      </section>
    </div>
  );
}

export default RegisterForm;
