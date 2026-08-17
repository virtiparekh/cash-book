import { useEffect, useState } from "react";

import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "../services/profileService";

import "./../styles/SettingsPage.css"
import {
  renameCashBookGroup,
  deleteCashBookGroup,
  leaveCashBookGroup,
} from "../services/groupService";

import { useCashBookGroups } from "../hooks/useCashBookGroups";

import type { CashBookGroup } from "../types/cashBook";
import {
  DEFAULT_CURRENCY,
  DEFAULT_OPENING_BALANCE,
} from "../constants/app";

import {
  CURRENCY_OPTIONS,
} from "../constants/currencies";

import {
  createCashBookGroup,
} from "../services/cashBookService";

import {
  validateCashBook,
} from "../utils/cashBookValidation";

type SettingsSection = "profile" | "cashbooks" | "security" | "preferences";

const SettingsPage = () => {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const {
    groups,
    loading: groupsLoading,
    reloadGroups,
  } = useCashBookGroups();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editingGroupId, setEditingGroupId] =
    useState<string | null>(null);

  const [editingGroupName, setEditingGroupName] =
    useState("");

  const [savingGroupId, setSavingGroupId] =
    useState<string | null>(null);

  const [processingGroupId, setProcessingGroupId] =
    useState<string | null>(null);
  useEffect(() => {
    loadProfile();
  }, []);

  const [
  showCreateCashBook,
  setShowCreateCashBook,
] = useState(false);

const [
  creatingCashBook,
  setCreatingCashBook,
] = useState(false);

const [
  createCashBookError,
  setCreateCashBookError,
] = useState("");

const [
  newCashBookName,
  setNewCashBookName,
] = useState("");

const [
  newCashBookDescription,
  setNewCashBookDescription,
] = useState("");

const [
  newCashBookOwnerName,
  setNewCashBookOwnerName,
] = useState(
  profile?.full_name ?? ""
);

const [
  newCashBookCurrency,
  setNewCashBookCurrency,
] = useState(
  DEFAULT_CURRENCY
);

const [
  newCashBookOpeningBalance,
  setNewCashBookOpeningBalance,
] = useState(
  DEFAULT_OPENING_BALANCE
);

  const [confirmationPopup, setConfirmationPopup] = useState<{
    type: "delete" | "leave";
    group: CashBookGroup;
  } | null>(null);

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

  useEffect(() => {

  if (profile?.full_name) {

    setNewCashBookOwnerName(
      profile.full_name
    );

  }

}, [
  profile?.full_name,
]);

async function handleCreateCashBook(
  event: React.FormEvent<HTMLFormElement>
) {

  event.preventDefault();

  if (creatingCashBook) {
    return;
  }

  setCreateCashBookError("");

  const validationError =
    validateCashBook(
      newCashBookName,
      newCashBookOwnerName,
      newCashBookOpeningBalance
    );

  if (validationError) {

    setCreateCashBookError(
      validationError
    );

    return;
  }

  try {

    setCreatingCashBook(true);

    // const groupId =
      await createCashBookGroup({

        name:
          newCashBookName.trim(),

        description:
          newCashBookDescription.trim(),

        currencyCode:
          newCashBookCurrency,

        openingBalance:
          newCashBookOpeningBalance,

        ownerName:
          newCashBookOwnerName.trim(),

      });

    /*
     * Refresh Cash Books.
     *
     * This also updates selectedCashBook
     * through useCashBookGroups.
     */
    await reloadGroups();

    /*
     * Close modal.
     */
    setShowCreateCashBook(false);

    /*
     * Clear form.
     */
    setNewCashBookName("");
    setNewCashBookDescription("");

    setNewCashBookOwnerName(
      profile?.full_name ?? ""
    );

    setNewCashBookCurrency(
      DEFAULT_CURRENCY
    );

    setNewCashBookOpeningBalance(
      DEFAULT_OPENING_BALANCE
    );

    setCreateCashBookError("");

    /*
     * Optional success message.
     */
    setSuccessMessage(
      "Cash Book created successfully."
    );

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (error: unknown) {

    console.error(
      "Unable to create Cash Book.",
      error
    );

    setCreateCashBookError(
      error instanceof Error
        ? error.message
        : "Unable to create Cash Book."
    );

  } finally {

    setCreatingCashBook(false);

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

  async function handleRenameGroup(
    group: CashBookGroup
  ) {

    const trimmedName =
      editingGroupName.trim();

    if (!trimmedName) {
      setError("Cash book name is required.");
      return;
    }

    if (trimmedName === group.name) {
      setEditingGroupId(null);
      return;
    }

    try {

      setSavingGroupId(group.id);
      setError("");
      setSuccessMessage("");

      await renameCashBookGroup(
        group.id,
        trimmedName
      );

      setEditingGroupId(null);

      await reloadGroups();

      setSuccessMessage(
        "Cash book name updated successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (err: unknown) {

      console.error(
        "Error renaming cash book:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to rename the cash book."
        );
      }

    } finally {

      setSavingGroupId(null);

    }
  }

  async function executeDeleteGroup(group: CashBookGroup) {
  try {
    setProcessingGroupId(group.id);
    setError("");
    setSuccessMessage("");

    await deleteCashBookGroup(group.id);

    await reloadGroups();

    setSuccessMessage(
      `"${group.name}" was deleted successfully.`
    );

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

  } catch (err: unknown) {
    console.error("Error deleting cash book:", err);

    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Unable to delete the cash book.");
    }
  } finally {
    setProcessingGroupId(null);
  }
}

  // async function handleDeleteGroup(
  //   group: CashBookGroup
  // ) {
  //   try {
  //     setProcessingGroupId(group.id);
  //     setError("");
  //     setSuccessMessage("");

  //     await deleteCashBookGroup(group.id);

  //     await reloadGroups();

  //     setSuccessMessage(
  //       `"${group.name}" was deleted successfully.`
  //     );

  //     window.setTimeout(() => {
  //       setSuccessMessage("");
  //     }, 3000);
  //   } catch (err: unknown) {
  //     console.error(
  //       "Error deleting cash book:",
  //       err
  //     );

  //     if (err instanceof Error) {
  //       setError(err.message);
  //     } else {
  //       setError(
  //         "Unable to delete the cash book."
  //       );
  //     }
  //   } finally {
  //     setProcessingGroupId(null);
  //   }
  // }

  async function handleLeaveGroup(
    group: CashBookGroup
  ) {
    try {
      setProcessingGroupId(group.id);
      setError("");
      setSuccessMessage("");

      await leaveCashBookGroup(group.id);

      await reloadGroups();

      setSuccessMessage(
        `You left "${group.name}" successfully.`
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: unknown) {
      console.error(
        "Error leaving cash book:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to leave the cash book."
        );
      }
    } finally {
      setProcessingGroupId(null);
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

  function renderCashBooksSection() {

    return (
      <div className="settings-section-content">

        <div className="settings-section-heading settings-section-heading--cashbooks">

  <div>
    <h2>Cash Books</h2>

    <p>
      Manage the cash books you belong to.
    </p>
  </div>

  <button
    type="button"
    className="settings-create-cashbook-button"
    onClick={() => {
      setShowCreateCashBook(true);
      setCreateCashBookError("");
    }}
  >
    + Create Cash Book
  </button>

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

        {groupsLoading ? (

          <div className="settings-loading">
            Loading your cash books...
          </div>

        ) : groups.length === 0 ? (

          <div className="cashbooks-empty">

            <div className="cashbooks-empty-icon">
              📖
            </div>

            <h3>
              No Cash Books
            </h3>

            <p>
              You are not currently a member of any cash book.
            </p>

          </div>

        ) : (

          <div className="cashbooks-list">

            {groups.map((group) => {

              const isEditing =
                editingGroupId === group.id;

              const isSaving =
                savingGroupId === group.id;

              const isProcessing =
                processingGroupId === group.id;

              return (

                <div
                  key={group.id}
                  className="cashbook-settings-item"
                >

                  <div className="cashbook-settings-info">

                    <div className="cashbook-settings-icon">
                      📖
                    </div>

                    <div className="cashbook-settings-details">

                      {isEditing ? (

                        <input
                          type="text"
                          value={editingGroupName}
                          onChange={(event) =>
                            setEditingGroupName(
                              event.target.value
                            )
                          }
                          className="cashbook-name-input"
                          autoFocus
                          disabled={isSaving}
                        />

                      ) : (

                        <h3>
                          {group.name}
                        </h3>

                      )}

                      <div className="cashbook-settings-meta">

                        <span>
                          {group.currencyCode}
                        </span>

                        <span className="cashbook-meta-separator">
                          •
                        </span>

                        <span>
                          {group.role === "admin"
                            ? "Admin"
                            : "Member"}
                        </span>

                      </div>

                    </div>

                  </div>


                  <div className="cashbook-settings-actions">

                    {group.role === "admin" ? (

                      isEditing ? (

                        <>
                          <button
                            type="button"
                            className="cashbook-action-button cashbook-action-button--save"
                            onClick={() =>
                              handleRenameGroup(group)
                            }
                            disabled={
                              isSaving ||
                              isProcessing
                            }
                          >
                            {isSaving
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            className="cashbook-action-button"
                            onClick={() =>
                              setEditingGroupId(null)
                            }
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                        </>

                      ) : (

                        <>
                          <button
                            type="button"
                            className="cashbook-action-button"
                            onClick={() => {
                              setEditingGroupId(
                                group.id
                              );

                              setEditingGroupName(
                                group.name
                              );

                              setError("");
                              setSuccessMessage("");
                            }}
                            disabled={isProcessing}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="cashbook-action-button cashbook-action-button--danger"
                            onClick={() =>
                              setConfirmationPopup({
                                type: "delete",
                                group,
                              })
                            }
                            disabled={isProcessing}
                          >
                            {isProcessing
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </>

                      )

                    ) : (

                      <button
                        type="button"
                        className="cashbook-action-button cashbook-action-button--danger"
                        onClick={() =>
                          setConfirmationPopup({
                            type: "leave",
                            group,
                          })
                        }
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? "Leaving..."
                          : "Leave"}
                      </button>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        )}

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
    <>
  {showCreateCashBook && (

    <div className="settings-popup-overlay">

      <div className="settings-create-cashbook-popup">

        <div className="settings-create-cashbook-header">

          <div>

            <h2>
              Create Cash Book
            </h2>

            <p>
              Create a new cash book for your family.
            </p>

          </div>

          <button
            type="button"
            className="settings-popup-close"
            onClick={() => {
              if (!creatingCashBook) {
                setShowCreateCashBook(false);
                setCreateCashBookError("");
              }
            }}
            disabled={creatingCashBook}
          >
            ×
          </button>

        </div>

        {createCashBookError && (

          <div className="settings-message settings-message--error">
            {createCashBookError}
          </div>

        )}

        <form
          className="settings-create-cashbook-form"
          onSubmit={handleCreateCashBook}
          autoComplete="off"
        >

          <div className="settings-create-field">

            <label htmlFor="create-cashbook-name">
              Cash Book Name
            </label>

            <input
              id="create-cashbook-name"
              type="text"
              value={newCashBookName}
              disabled={creatingCashBook}
              required
              placeholder="e.g. Parekh Family Cash Book"
              onChange={(event) => {

                setCreateCashBookError("");

                setNewCashBookName(
                  event.target.value
                );

              }}
            />

          </div>


          <div className="settings-create-field">

            <label htmlFor="create-cashbook-description">
              Description
            </label>

            <textarea
              id="create-cashbook-description"
              value={newCashBookDescription}
              disabled={creatingCashBook}
              placeholder="Optional description"
              rows={3}
              onChange={(event) => {

                setCreateCashBookError("");

                setNewCashBookDescription(
                  event.target.value
                );

              }}
            />

          </div>


          <div className="settings-create-field">

            <label htmlFor="create-cashbook-owner">
              Owner Name
            </label>

            <input
              id="create-cashbook-owner"
              type="text"
              value={newCashBookOwnerName}
              disabled={creatingCashBook}
              required
              placeholder="Owner name"
              onChange={(event) => {

                setCreateCashBookError("");

                setNewCashBookOwnerName(
                  event.target.value
                );

              }}
            />

          </div>


          <div className="settings-create-field">

            <label htmlFor="create-cashbook-currency">
              Currency
            </label>

            <select
              id="create-cashbook-currency"
              value={newCashBookCurrency}
              disabled={creatingCashBook}
              onChange={(event) => {

                setCreateCashBookError("");

                setNewCashBookCurrency(
                  event.target.value
                );

              }}
            >

              {CURRENCY_OPTIONS.map(
                (option) => (

                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>

                )
              )}

            </select>

          </div>


          <div className="settings-create-field">

            <label htmlFor="create-cashbook-opening-balance">
              Opening Balance
            </label>

            <input
              id="create-cashbook-opening-balance"
              type="number"
              value={newCashBookOpeningBalance}
              disabled={creatingCashBook}
              onChange={(event) => {

                setCreateCashBookError("");

                setNewCashBookOpeningBalance(
                  Number(event.target.value)
                );

              }}
            />

            <span className="settings-field-help">
              You can keep this as 0 if you're starting fresh.
            </span>

          </div>


          <div className="settings-create-cashbook-actions">

            <button
              type="button"
              className="settings-confirmation-cancel"
              disabled={creatingCashBook}
              onClick={() => {

                setShowCreateCashBook(false);
                setCreateCashBookError("");

              }}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="settings-create-cashbook-submit"
              disabled={creatingCashBook}
            >
              {creatingCashBook
                ? "Creating..."
                : "Create Cash Book"}
            </button>

          </div>

        </form>

      </div>

    </div>

  )}
      {confirmationPopup && (
        <div className="settings-popup-overlay">
          <div className="settings-confirmation-popup">

            <div className="settings-confirmation-icon">
              {confirmationPopup.type === "delete"
                ? "🗑️"
                : "🚪"}
            </div>

            <h3>
              {confirmationPopup.type === "delete"
                ? "Delete Cash Book?"
                : "Leave Cash Book?"}
            </h3>

            <p>
              {confirmationPopup.type === "delete"
                ? `Are you sure you want to delete "${confirmationPopup.group.name}"? This action cannot be undone.`
                : `Are you sure you want to leave "${confirmationPopup.group.name}"? You will no longer have access to this cash book unless you are invited again.`}
            </p>

            <div className="settings-confirmation-actions">

              <button
                type="button"
                className="settings-confirmation-cancel"
                onClick={() => setConfirmationPopup(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmationPopup.type === "delete"
                    ? "settings-confirmation-danger"
                    : "settings-confirmation-leave"
                }
                onClick={async () => {
                  const group = confirmationPopup.group;
                  const type = confirmationPopup.type;

                  setConfirmationPopup(null);

                  if (type === "delete") {
                    await executeDeleteGroup(group);
                  } else {
                    await handleLeaveGroup(group);
                  }
                }}
              >
                {confirmationPopup.type === "delete"
                  ? "Delete"
                  : "Leave"}
              </button>

            </div>

          </div>
        </div>
      )}

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
              className={`settings-nav-item ${activeSection === "profile"
                  ? "settings-nav-item--active"
                  : ""
                }`}
              onClick={() => handleSectionChange("profile")}
            >
              <span className="settings-nav-icon">
                👤
              </span>

              <span className="settings-nav-text">
                <strong>Profile</strong>

                <small>
                  Personal information
                </small>
              </span>
            </button>

            <button
              type="button"
              className={`settings-nav-item ${activeSection === "cashbooks"
                  ? "settings-nav-item--active"
                  : ""
                }`}
              onClick={() =>
                handleSectionChange("cashbooks")
              }
            >
              <span className="settings-nav-icon">
                📖
              </span>

              <span className="settings-nav-text">
                <strong>
                  Cash Books
                </strong>

                <small>
                  Manage your cash books
                </small>
              </span>
            </button>

            <button
              type="button"
              className={`settings-nav-item ${activeSection === "security"
                  ? "settings-nav-item--active"
                  : ""
                }`}
              onClick={() =>
                handleSectionChange("security")
              }
            >
              <span className="settings-nav-icon">
                🔒
              </span>

              <span className="settings-nav-text">
                <strong>
                  Security
                </strong>

                <small>
                  Account security
                </small>
              </span>
            </button>

            <button
              type="button"
              className={`settings-nav-item ${activeSection === "preferences"
                  ? "settings-nav-item--active"
                  : ""
                }`}
              onClick={() =>
                handleSectionChange("preferences")
              }
            >
              <span className="settings-nav-icon">
                ⚙️
              </span>

              <span className="settings-nav-text">
                <strong>
                  Preferences
                </strong>

                <small>
                  Application preferences
                </small>
              </span>
            </button>

          </aside>

          <main className="settings-card">

            {activeSection === "profile" &&
              renderProfileSection()}

            {activeSection === "cashbooks" &&
              renderCashBooksSection()}

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
    </>
  );
};

export default SettingsPage;