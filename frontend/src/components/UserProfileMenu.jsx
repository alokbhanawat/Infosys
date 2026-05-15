import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearStoredToken } from "../utils/auth";
import "../styles/profile-menu.css";

function UserProfileMenu({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const initials = useMemo(() => {
    const nameParts = (user?.name || "User")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return nameParts.map((part) => part[0]?.toUpperCase() || "").join("") || "U";
  }, [user?.name]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearStoredToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-menu-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open profile options"
      >
        <span className="profile-menu-avatar">{initials}</span>
        <span className="profile-menu-trigger-copy">
          <strong>Profile</strong>
          <small>Open menu</small>
        </span>
        <span className={`profile-menu-chevron ${isOpen ? "profile-menu-chevron-open" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen ? (
        <div className="profile-menu-dropdown" role="menu">
          <div className="profile-menu-header">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || "Signed in"}</span>
          </div>

          <Link className="profile-menu-item" to="/cart" onClick={() => setIsOpen(false)}>
            Open cart
            <span>View items added by you</span>
          </Link>
          <Link className="profile-menu-item" to="/orders" onClick={() => setIsOpen(false)}>
            Orders
            <span>Check your placed orders</span>
          </Link>
          <Link className="profile-menu-item" to="/profile" onClick={() => setIsOpen(false)}>
            Profile update
            <span>Change name, email, phone and password</span>
          </Link>
          <button
            type="button"
            className="profile-menu-item profile-menu-item-danger"
            onClick={handleLogout}
          >
            Logout
            <span>Sign out from your account</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default UserProfileMenu;
