import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearStoredToken } from "../utils/auth";
import "../styles/profile-menu.css";

function ProfileMenuIcon({ type }) {
  const icons = {
    profile: (
      <path d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Zm-7 8a7 7 0 0 1 14 0" />
    ),
    addresses: (
      <path d="M12 21s6.2-5.3 6.2-10.8A6.2 6.2 0 1 0 5.8 10.2C5.8 15.7 12 21 12 21Zm0-8.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z" />
    ),
    logout: (
      <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10m5-4 3-3-3-3m2.7 3H9.5" />
    ),
  };

  return (
    <span className="profile-menu-item-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {icons[type]}
      </svg>
    </span>
  );
}

function UserProfileMenu({ user }) {
  const navigate = useNavigate();
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
        <span className="profile-menu-avatar-wrap">
          <span className="profile-menu-avatar">{initials}</span>
          <span className="profile-menu-status" aria-hidden="true" />
        </span>
        <span className="profile-menu-trigger-copy">
          <strong>{user?.name || "Profile"}</strong>
          <small>Account settings</small>
        </span>
        <span className={`profile-menu-chevron ${isOpen ? "profile-menu-chevron-open" : ""}`}>{"\u25BE"}</span>
      </button>

      {isOpen ? (
        <div className="profile-menu-dropdown" role="menu">
          <div className="profile-menu-header">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || "Signed in"}</span>
          </div>

          <Link className="profile-menu-item" to="/profile" onClick={() => setIsOpen(false)}>
            <ProfileMenuIcon type="profile" />
            <span>Profile update</span>
          </Link>
          <Link className="profile-menu-item" to="/addresses" onClick={() => setIsOpen(false)}>
            <ProfileMenuIcon type="addresses" />
            <span>Addresses</span>
          </Link>
          <button
            type="button"
            className="profile-menu-item profile-menu-item-danger"
            onClick={handleLogout}
          >
            <ProfileMenuIcon type="logout" />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default UserProfileMenu;
