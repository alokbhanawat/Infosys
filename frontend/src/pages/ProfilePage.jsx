import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserProfileMenu from "../components/UserProfileMenu";
import {
  getCurrentUserProfile,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from "../services/authService";
import { getCurrentUser, setStoredSession } from "../utils/auth";
import "../styles/profile-page.css";

const DEFAULT_PROFILE_FORM = {
  name: "",
  email: "",
  phone: "",
};

const DEFAULT_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function ProfilePage() {
  const [user, setUser] = useState(getCurrentUser());
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE_FORM);
  const [passwordForm, setPasswordForm] = useState(DEFAULT_PASSWORD_FORM);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileMessageType, setProfileMessageType] = useState("success");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageType, setPasswordMessageType] = useState("success");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      try {
        const response = await getCurrentUserProfile();
        const profile = response.data || null;

        setUser(profile);
        setProfileForm({
          name: profile?.name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
        });
      } catch (error) {
        setProfileMessage(error?.response?.data?.message || "Unable to load your profile.");
        setProfileMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = ({ target }) => {
    const { name, value } = target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = ({ target }) => {
    const { name, value } = target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");

    try {
      const response = await updateCurrentUserProfile(profileForm);
      const updatedUser = response.data;

      setStoredSession({
        token: updatedUser?.token,
        userId: updatedUser?.userId,
        role: updatedUser?.role,
      });

      const refreshedProfile = await getCurrentUserProfile();
      setUser(refreshedProfile.data || null);
      setProfileForm({
        name: refreshedProfile.data?.name || "",
        email: refreshedProfile.data?.email || "",
        phone: refreshedProfile.data?.phone || "",
      });
      setProfileMessage("Profile updated successfully.");
      setProfileMessageType("success");
    } catch (error) {
      setProfileMessage(error?.response?.data?.message || "Unable to update your profile.");
      setProfileMessageType("error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage("");

    try {
      const response = await updateCurrentUserPassword(passwordForm);
      setPasswordForm(DEFAULT_PASSWORD_FORM);
      setPasswordMessage(response?.data?.message || "Password updated successfully.");
      setPasswordMessageType("success");
    } catch (error) {
      setPasswordMessage(error?.response?.data?.message || "Unable to update your password.");
      setPasswordMessageType("error");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <section className="profile-hero">
          <div>
            <span className="profile-badge">Profile settings</span>
            <h1>Update your account</h1>
            <p>Manage your basic details and password from one place.</p>
          </div>

          <div className="profile-hero-actions">
            <Link className="back-link" to="/products">
              Back to products
            </Link>
            <UserProfileMenu user={user} />
          </div>
        </section>

        {loading ? (
          <section className="profile-card">
            <p className="empty-state">Loading your profile...</p>
          </section>
        ) : (
          <section className="profile-grid">
            <article className="profile-card">
              <div className="profile-card-header">
                <div>
                  <span>Basic details</span>
                  <h2>Profile update</h2>
                </div>
              </div>

              <form className="profile-form-grid" onSubmit={handleProfileSubmit}>
                <label className="profile-field">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your name"
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    required
                  />
                </label>

                <label className="profile-field profile-field-full">
                  <span>Phone</span>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                  />
                </label>

                {profileMessage ? <p className={`form-message ${profileMessageType}`}>{profileMessage}</p> : null}

                <button type="submit" className="primary-btn profile-submit-btn" disabled={profileSaving}>
                  {profileSaving ? "Updating..." : "Update profile"}
                </button>
              </form>
            </article>

            <article className="profile-card">
              <div className="profile-card-header">
                <div>
                  <span>Security</span>
                  <h2>Password update</h2>
                </div>
              </div>

              <form className="profile-form-grid" onSubmit={handlePasswordSubmit}>
                <label className="profile-field profile-field-full">
                  <span>Current password</span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>New password</span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Re-enter new password"
                    required
                  />
                </label>

                {passwordMessage ? <p className={`form-message ${passwordMessageType}`}>{passwordMessage}</p> : null}

                <button type="submit" className="primary-btn profile-submit-btn" disabled={passwordSaving}>
                  {passwordSaving ? "Updating..." : "Update password"}
                </button>
              </form>
            </article>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
