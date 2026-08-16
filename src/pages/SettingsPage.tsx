import { useEffect, useState } from "react";

import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "../services/profileService";

import "./../styles/SettingsPage.css"

type SettingsSection = "profile" | "security" | "preferences";

const SettingsPage = () => {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProfile();

      setProfile(data);
      setFullName(data.full_name);
      setContactNo(data.contact_no);

      /*
       * Email is stored in Supabase Auth rather than
       * public.profiles.
       */
      const { supabase } = await import("../lib/supabase");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? "");
    } catch (err: unknown) {
      console.error("Error loading profile:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load your profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    setError("");
    setSuccessMessage("");

    const trimmedName = fullName.trim();
    const trimmedContact = contactNo.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(trimmedContact)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await updateMyProfile(
        trimmedName,
        trimmedContact
      );

      setProfile(updatedProfile);
      setFullName(updatedProfile.full_name);
      setContactNo(updatedProfile.contact_no);

      setSuccessMessage("Profile updated successfully.");

      /*
       * Remove the success message after a few seconds.
       */
      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: unknown) {
      console.error("Error updating profile:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to update your profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleSectionChange(section: SettingsSection) {
    setActiveSection(section);

    setError("");
    setSuccessMessage("");
  }

  function getInitials(name: string) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return "?";
    }

    const words = trimmedName.split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  function renderProfileSection() {
    if (loading) {
      return (
        <div className="settings-loading">
          Loading your profile...
        </div>
      );
    }

    return (
      <div className="settings-section-content">
        <div className="settings-section-heading">
          <h2>Profile</h2>

          <p>
            Manage your personal information and contact details.
          </p>
        </div>

        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
              />
            ) : (
              <span>{getInitials(fullName)}</span>
            )}
          </div>

          <div className="profile-avatar-info">
            <h3>{fullName || "Your Profile"}</h3>

            <p>
              Your profile information is used across the Family
              Cash Book.
            </p>
          </div>
        </div>

        {error && (
          <div className="settings-message settings-message--error">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="settings-message settings-message--success">
            {successMessage}
          </div>
        )}

        <div className="settings-form">
          <div className="settings-form-field">
            <label htmlFor="settings-full-name">
              Full Name
            </label>

            <input
              id="settings-full-name"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Enter your full name"
              disabled={saving}
            />
          </div>

          <div className="settings-form-field">
            <label htmlFor="settings-email">
              Email Address
            </label>

            <input
              id="settings-email"
              type="email"
              value={email}
              disabled
              readOnly
            />

            <span className="settings-field-help">
              Email address is managed by your account login.
            </span>
          </div>

          <div className="settings-form-field">
            <label htmlFor="settings-contact-no">
              Contact Number
            </label>

            <input
              id="settings-contact-no"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={contactNo}
              onChange={(event) => {
                const value = event.target.value.replace(
                  /\D/g,
                  ""
                );

                setContactNo(value);
              }}
              placeholder="10-digit mobile number"
              disabled={saving}
            />

            <span className="settings-field-help">
              Enter a valid 10-digit Indian mobile number.
            </span>
          </div>

          <div className="settings-form-actions">
            <button
              type="button"
              className="settings-save-button"
              onClick={handleSaveProfile}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderComingSoon(
    title: string,
    description: string
  ) {
    return (
      <div className="settings-section-content">
        <div className="settings-section-heading">
          <h2>{title}</h2>

          <p>{description}</p>
        </div>

        <div className="settings-coming-soon">
          <div className="settings-coming-soon-icon">
            ⚙
          </div>

          <h3>Coming Soon</h3>

          <p>
            This section will be available in a future update.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your account and application preferences.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <button
            type="button"
            className={`settings-nav-item ${
              activeSection === "profile"
                ? "settings-nav-item--active"
                : ""
            }`}
            onClick={() => handleSectionChange("profile")}
          >
            <span className="settings-nav-icon">👤</span>

            <span className="settings-nav-text">
              <strong>Profile</strong>

              <small>
                Personal information
              </small>
            </span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${
              activeSection === "security"
                ? "settings-nav-item--active"
                : ""
            }`}
            onClick={() => handleSectionChange("security")}
          >
            <span className="settings-nav-icon">🔒</span>

            <span className="settings-nav-text">
              <strong>Security</strong>

              <small>
                Account security
              </small>
            </span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${
              activeSection === "preferences"
                ? "settings-nav-item--active"
                : ""
            }`}
            onClick={() =>
              handleSectionChange("preferences")
            }
          >
            <span className="settings-nav-icon">⚙️</span>

            <span className="settings-nav-text">
              <strong>Preferences</strong>

              <small>
                Application preferences
              </small>
            </span>
          </button>
        </aside>

        <main className="settings-card">
          {activeSection === "profile" &&
            renderProfileSection()}

          {activeSection === "security" &&
            renderComingSoon(
              "Security",
              "Manage your account security and authentication settings."
            )}

          {activeSection === "preferences" &&
            renderComingSoon(
              "Preferences",
              "Manage your Family Cash Book application preferences."
            )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;