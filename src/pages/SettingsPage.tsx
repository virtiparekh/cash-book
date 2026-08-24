import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "../services/profileService";

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

import { CURRENCY_OPTIONS } from "../constants/currencies";

import { createCashBookGroup } from "../services/cashBookService";

import { validateCashBook } from "../utils/cashBookValidation";

import {
  loadCategories,
  loadPaymentModes,
  createCategory,
  createPaymentMode,
  type MasterDataOption,
} from "../services/masterDataService";

import "./../styles/SettingsPage.css";

import { supabase } from "../lib/supabase";


type SettingsSection =
  | "profile"
  | "cashbooks"
  | "masterdata"
  | "security"
  | "preferences";


type MasterDataType =
  | "category"
  | "paymentMode";


const SettingsPage = () => {

  /* =====================================================
     SECTION
  ===================================================== */

  const [
    activeSection,
    setActiveSection,
  ] = useState<SettingsSection>("profile");


  /* =====================================================
     CASH BOOKS
  ===================================================== */

  const {
    groups,
    loading: groupsLoading,
    reloadGroups,
  } = useCashBookGroups();


  /* =====================================================
     PROFILE
  ===================================================== */

  const [
    profile,
    setProfile,
  ] = useState<UserProfile | null>(null);

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    contactNo,
    setContactNo,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);


  /* =====================================================
     COMMON MESSAGES
  ===================================================== */

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  /* =====================================================
     CASH BOOK EDITING
  ===================================================== */

  const [
    editingGroupId,
    setEditingGroupId,
  ] = useState<string | null>(null);

  const [
    editingGroupName,
    setEditingGroupName,
  ] = useState("");

  const [
    savingGroupId,
    setSavingGroupId,
  ] = useState<string | null>(null);

  const [
    processingGroupId,
    setProcessingGroupId,
  ] = useState<string | null>(null);


  /* =====================================================
     CREATE CASH BOOK
  ===================================================== */

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
  ] = useState("");

  const [
    newCashBookCurrency,
    setNewCashBookCurrency,
  ] = useState(DEFAULT_CURRENCY);

  const [
    newCashBookOpeningBalance,
    setNewCashBookOpeningBalance,
  ] = useState(DEFAULT_OPENING_BALANCE);


  /* =====================================================
     CASH BOOK CONFIRMATION
  ===================================================== */

  const [
    confirmationPopup,
    setConfirmationPopup,
  ] = useState<{
    type: "delete" | "leave";
    group: CashBookGroup;
  } | null>(null);


  /* =====================================================
     MASTER DATA
  ===================================================== */

  const [
    categories,
    setCategories,
  ] = useState<MasterDataOption[]>([]);

  const [
    paymentModes,
    setPaymentModes,
  ] = useState<MasterDataOption[]>([]);

  const [
    masterDataLoading,
    setMasterDataLoading,
  ] = useState(false);

  const [
    masterDataError,
    setMasterDataError,
  ] = useState("");

  const [
    masterDataSuccess,
    setMasterDataSuccess,
  ] = useState("");

  /*
   * Mobile / card expand-collapse.
   * Both are kept open by default on desktop.
   */
  const [
    categoriesExpanded,
    setCategoriesExpanded,
  ] = useState(true);

  const [
    paymentModesExpanded,
    setPaymentModesExpanded,
  ] = useState(true);

  /*
   * Search fields.
   */
  const [
    categorySearch,
    setCategorySearch,
  ] = useState("");

  const [
    paymentModeSearch,
    setPaymentModeSearch,
  ] = useState("");


  /* =====================================================
     MASTER DATA POPUP
  ===================================================== */

  const [
    masterDataPopup,
    setMasterDataPopup,
  ] = useState<{
    type: MasterDataType;
    mode: "create" | "edit";
    item?: MasterDataOption;
  } | null>(null);

  const [
    masterDataName,
    setMasterDataName,
  ] = useState("");

  const [
    masterDataSaving,
    setMasterDataSaving,
  ] = useState(false);


  /* =====================================================
     MASTER DATA DELETE CONFIRMATION
  ===================================================== */

  const [
    masterDataDeletePopup,
    setMasterDataDeletePopup,
  ] = useState<{
    type: MasterDataType;
    item: MasterDataOption;
  } | null>(null);


  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {

    async function loadProfile() {

      try {

        setLoading(true);
        setError("");

        const data =
          await getMyProfile();

        setProfile(data);

        setFullName(
          data.full_name
        );

        setContactNo(
          data.contact_no
        );

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        setEmail(
          user?.email ?? ""
        );

      } catch (err: unknown) {

        console.error(
          "Error loading profile:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );

      } finally {

        setLoading(false);

      }
    }

    loadProfile();

  }, []);


  /* =====================================================
     SET DEFAULT OWNER NAME
  ===================================================== */

  useEffect(() => {

    if (profile?.full_name) {

      setNewCashBookOwnerName(
        profile.full_name
      );

    }

  }, [
    profile?.full_name,
  ]);


  /* =====================================================
     LOAD MASTER DATA
  ===================================================== */

  useEffect(() => {

    async function loadMasterData() {

      if (!groups.length) {

        setCategories([]);
        setPaymentModes([]);

        return;
      }

      const group =
        groups[0];

      try {

        setMasterDataLoading(true);
        setMasterDataError("");

        const [
          loadedCategories,
          loadedPaymentModes,
        ] = await Promise.all([

          loadCategories(
            group.id
          ),

          loadPaymentModes(
            group.id
          ),

        ]);

        setCategories(
          loadedCategories
        );

        setPaymentModes(
          loadedPaymentModes
        );

      } catch (err: unknown) {

        console.error(
          "Unable to load master data:",
          err
        );

        setMasterDataError(
          err instanceof Error
            ? err.message
            : "Unable to load categories and payment modes."
        );

      } finally {

        setMasterDataLoading(false);

      }
    }

    loadMasterData();

  }, [
    groups,
  ]);


  /* =====================================================
     FILTER MASTER DATA
  ===================================================== */

  const filteredCategories =
    categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(
          categorySearch
            .trim()
            .toLowerCase()
        )
    );


  const filteredPaymentModes =
    paymentModes.filter((paymentMode) =>
      paymentMode.name
        .toLowerCase()
        .includes(
          paymentModeSearch
            .trim()
            .toLowerCase()
        )
    );


  /* =====================================================
     CREATE CASH BOOK
  ===================================================== */

  async function handleCreateCashBook(
    event: FormEvent<HTMLFormElement>
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

      await reloadGroups();

      setShowCreateCashBook(false);

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

      setSuccessMessage(
        "Cash Book created successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (err: unknown) {

      console.error(
        "Unable to create Cash Book.",
        err
      );

      setCreateCashBookError(
        err instanceof Error
          ? err.message
          : "Unable to create Cash Book."
      );

    } finally {

      setCreatingCashBook(false);

    }
  }


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  async function handleSaveProfile() {

    setError("");
    setSuccessMessage("");

    const trimmedName =
      fullName.trim();

    const trimmedContact =
      contactNo.trim();

    if (!trimmedName) {

      setError(
        "Full name is required."
      );

      return;
    }

    if (
      !/^[6-9][0-9]{9}$/.test(
        trimmedContact
      )
    ) {

      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );

      return;
    }

    try {

      setSaving(true);

      const updatedProfile =
        await updateMyProfile(
          trimmedName,
          trimmedContact
        );

      setProfile(
        updatedProfile
      );

      setFullName(
        updatedProfile.full_name
      );

      setContactNo(
        updatedProfile.contact_no
      );

      setSuccessMessage(
        "Profile updated successfully."
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (err: unknown) {

      console.error(
        "Error updating profile:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile."
      );

    } finally {

      setSaving(false);

    }
  }


  /* =====================================================
     RENAME CASH BOOK
  ===================================================== */

  async function handleRenameGroup(
    group: CashBookGroup
  ) {

    const trimmedName =
      editingGroupName.trim();

    if (!trimmedName) {

      setError(
        "Cash book name is required."
      );

      return;
    }

    if (
      trimmedName === group.name
    ) {

      setEditingGroupId(null);

      return;
    }

    try {

      setSavingGroupId(
        group.id
      );

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

      setError(
        err instanceof Error
          ? err.message
          : "Unable to rename the cash book."
      );

    } finally {

      setSavingGroupId(null);

    }
  }


  /* =====================================================
     DELETE CASH BOOK
  ===================================================== */

  async function executeDeleteGroup(
    group: CashBookGroup
  ) {

    try {

      setProcessingGroupId(
        group.id
      );

      setError("");
      setSuccessMessage("");

      await deleteCashBookGroup(
        group.id
      );

      await reloadGroups();

      setSuccessMessage(
        `"${group.name}" was deleted successfully.`
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (err: unknown) {

      console.error(
        "Error deleting cash book:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the cash book."
      );

    } finally {

      setProcessingGroupId(
        null
      );

    }
  }


  /* =====================================================
     LEAVE CASH BOOK
  ===================================================== */

  async function handleLeaveGroup(
    group: CashBookGroup
  ) {

    try {

      setProcessingGroupId(
        group.id
      );

      setError("");
      setSuccessMessage("");

      await leaveCashBookGroup(
        group.id
      );

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

      setError(
        err instanceof Error
          ? err.message
          : "Unable to leave the cash book."
      );

    } finally {

      setProcessingGroupId(
        null
      );

    }
  }


  /* =====================================================
     SECTION CHANGE
  ===================================================== */

  function handleSectionChange(
    section: SettingsSection
  ) {

    setActiveSection(
      section
    );

    setError("");
    setSuccessMessage("");
    setMasterDataError("");
    setMasterDataSuccess("");
  }


  /* =====================================================
     INITIALS
  ===================================================== */

  function getInitials(
    name: string
  ) {

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      return "?";
    }

    const words =
      trimmedName.split(/\s+/);

    if (
      words.length === 1
    ) {

      return words[0]
        .charAt(0)
        .toUpperCase();

    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }


  /* =====================================================
     CURRENT GROUP
  ===================================================== */

  function getCurrentGroup():
    CashBookGroup | null {

    if (!groups.length) {
      return null;
    }

    return groups[0];
  }


  /* =====================================================
     MASTER DATA TITLE
  ===================================================== */

  function getMasterDataTitle(
    type: MasterDataType
  ) {

    return type === "category"
      ? "Category"
      : "Payment Mode";
  }


  /* =====================================================
     OPEN CREATE MASTER DATA
  ===================================================== */

  function handleAddMasterData(
    type: MasterDataType
  ) {

    const group =
      getCurrentGroup();

    if (!group) {

      setMasterDataError(
        "Please create or join a Cash Book first."
      );

      return;
    }

    if (
      group.role !== "admin"
    ) {

      setMasterDataError(
        "Only Cash Book admins can add categories or payment modes."
      );

      return;
    }

    setMasterDataName("");

    setMasterDataPopup({

      type,

      mode: "create",

    });

    setMasterDataError("");
    setMasterDataSuccess("");
  }


  /* =====================================================
     OPEN EDIT MASTER DATA
  ===================================================== */

  function handleEditMasterData(
    type: MasterDataType,
    item: MasterDataOption
  ) {

    const group =
      getCurrentGroup();

    if (
      !group ||
      group.role !== "admin"
    ) {

      return;
    }

    setMasterDataName(
      item.name
    );

    setMasterDataPopup({

      type,

      mode: "edit",

      item,

    });

    setMasterDataError("");
    setMasterDataSuccess("");
  }


  /* =====================================================
     SAVE MASTER DATA
  ===================================================== */

  async function handleSaveMasterData(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    if (
      masterDataSaving ||
      !masterDataPopup
    ) {

      return;
    }

    const group =
      getCurrentGroup();

    if (!group) {

      setMasterDataError(
        "Please select a Cash Book."
      );

      return;
    }

    if (
      group.role !== "admin"
    ) {

      setMasterDataError(
        "Only Cash Book admins can manage master data."
      );

      return;
    }

    const trimmedName =
      masterDataName.trim();

    if (!trimmedName) {

      setMasterDataError(
        `${getMasterDataTitle(masterDataPopup.type)} name is required.`
      );

      return;
    }

    try {

      setMasterDataSaving(true);
      setMasterDataError("");

      const popupType =
        masterDataPopup.type;

      const popupMode =
        masterDataPopup.mode;

      if (
        popupMode === "create"
      ) {

        if (
          popupType === "category"
        ) {

          const created =
            await createCategory(
              group.id,
              trimmedName,
              "cash_in"
            );

          setCategories(
            (previous) =>
              [
                ...previous,
                created,
              ].sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              )
          );

        } else {

          const created =
            await createPaymentMode(
              group.id,
              trimmedName
            );

          setPaymentModes(
            (previous) =>
              [
                ...previous,
                created,
              ].sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              )
          );
        }

        setMasterDataPopup(null);
        setMasterDataName("");

        setMasterDataSuccess(
          `${getMasterDataTitle(popupType)} added successfully.`
        );

      } else {

        if (!masterDataPopup.item) {
          throw new Error(
            "Master data item not found."
          );
        }

        const table =
          popupType === "category"
            ? "categories"
            : "payment_modes";

        const {
          data,
          error: updateError,
        } = await supabase
          .from(table)
          .update({
            name: trimmedName,
          })
          .eq(
            "id",
            masterDataPopup.item.id
          )
          .select("id,name")
          .single();

        if (updateError) {
          throw updateError;
        }

        if (!data) {
          throw new Error(
            `Unable to rename ${getMasterDataTitle(popupType).toLowerCase()}.`
          );
        }

        if (
          popupType === "category"
        ) {

          setCategories(
            (previous) =>
              previous
                .map(
                  (item) =>
                    item.id === data.id
                      ? {
                        ...item,
                        name: data.name,
                      }
                      : item
                )
                .sort(
                  (a, b) =>
                    a.name.localeCompare(
                      b.name
                    )
                )
          );

        } else {

          setPaymentModes(
            (previous) =>
              previous
                .map(
                  (item) =>
                    item.id === data.id
                      ? {
                        ...item,
                        name: data.name,
                      }
                      : item
                )
                .sort(
                  (a, b) =>
                    a.name.localeCompare(
                      b.name
                    )
                )
          );
        }

        setMasterDataPopup(null);
        setMasterDataName("");

        setMasterDataSuccess(
          `${getMasterDataTitle(popupType)} renamed successfully.`
        );
      }

      window.setTimeout(() => {
        setMasterDataSuccess("");
      }, 3000);

    } catch (err: unknown) {

      console.error(
        "Error saving master data:",
        err
      );

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code ===
        "23505"
      ) {

        setMasterDataError(
          `A ${getMasterDataTitle(
            masterDataPopup.type
          ).toLowerCase()} with this name already exists.`
        );

      } else {

        setMasterDataError(
          err instanceof Error
            ? err.message
            : `Unable to save ${getMasterDataTitle(
              masterDataPopup.type
            ).toLowerCase()}.`
        );
      }

    } finally {

      setMasterDataSaving(false);

    }
  }


  /* =====================================================
     DELETE MASTER DATA
  ===================================================== */

  async function executeDeleteMasterData() {

    if (
      !masterDataDeletePopup
    ) {

      return;
    }

    const {
      type,
      item,
    } =
      masterDataDeletePopup;

    const group =
      getCurrentGroup();

    if (
      !group ||
      group.role !== "admin"
    ) {

      setMasterDataDeletePopup(null);

      return;
    }

    try {

      setMasterDataSaving(true);
      setMasterDataError("");

      const table =
        type === "category"
          ? "categories"
          : "payment_modes";

      const {
        error: deleteError,
      } = await supabase
        .from(table)
        .update({
          is_active: false,
        })
        .eq(
          "id",
          item.id
        );

      if (deleteError) {
        throw deleteError;
      }

      if (
        type === "category"
      ) {

        setCategories(
          (previous) =>
            previous.filter(
              (entry) =>
                entry.id !== item.id
            )
        );

      } else {

        setPaymentModes(
          (previous) =>
            previous.filter(
              (entry) =>
                entry.id !== item.id
            )
        );
      }

      setMasterDataDeletePopup(null);

      setMasterDataSuccess(
        `"${item.name}" deleted successfully.`
      );

      window.setTimeout(() => {
        setMasterDataSuccess("");
      }, 3000);

    } catch (err: unknown) {

      console.error(
        "Error deleting master data:",
        err
      );

      setMasterDataError(
        err instanceof Error
          ? err.message
          : `Unable to delete ${getMasterDataTitle(
            type
          ).toLowerCase()}.`
      );

      setMasterDataDeletePopup(null);

    } finally {

      setMasterDataSaving(false);

    }
  }


  /* =====================================================
     PROFILE SECTION
  ===================================================== */

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

              <span>
                {getInitials(fullName)}
              </span>

            )}

          </div>


          <div className="profile-avatar-info">

            <h3>
              {fullName || "Your Profile"}
            </h3>

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
                setFullName(
                  event.target.value
                )
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

                const value =
                  event.target.value.replace(
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
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* =====================================================
     CASH BOOKS SECTION
  ===================================================== */

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

            <h3>No Cash Books</h3>

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
                              handleRenameGroup(
                                group
                              )
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


  /* =====================================================
     MASTER DATA SECTION
  ===================================================== */

  function renderMasterDataSection() {

    const group =
      getCurrentGroup();

    const isAdmin =
      group?.role === "admin";


    return (

      <div className="settings-section-content">

        <div className="settings-section-heading">

          <h2>
            Categories & Payment Modes
          </h2>

          <p>
            Manage the categories and payment modes used in your
            Cash Book.
          </p>

        </div>


        {!group ? (

          <div className="cashbooks-empty">

            <div className="cashbooks-empty-icon">
              ⚙️
            </div>

            <h3>
              No Cash Book
            </h3>

            <p>
              Create or join a Cash Book before managing categories
              and payment modes.
            </p>

          </div>

        ) : (

          <>

            {masterDataError && (

              <div className="settings-message settings-message--error">
                {masterDataError}
              </div>

            )}


            {masterDataSuccess && (

              <div className="settings-message settings-message--success">
                {masterDataSuccess}
              </div>

            )}


            {masterDataLoading ? (

              <div className="settings-loading">
                Loading categories and payment modes...
              </div>

            ) : (

              <div className="master-data-management">

                {/* =================================================
                   CATEGORIES
                ================================================= */}

                <div className="master-data-card">

                  <div className="master-data-card-header">

                    <div className="master-data-card-title">

                      <div>

                        <h3>
                          Categories
                        </h3>

                        <p>
                          {categories.length}{" "}
                          {categories.length === 1
                            ? "category"
                            : "categories"}
                        </p>

                      </div>


                      <button
                        type="button"
                        className="master-data-mobile-toggle"
                        onClick={() =>
                          setCategoriesExpanded(
                            (previous) =>
                              !previous
                          )
                        }
                        aria-expanded={
                          categoriesExpanded
                        }
                        aria-label={
                          categoriesExpanded
                            ? "Collapse categories"
                            : "Expand categories"
                        }
                      >
                        {categoriesExpanded
                          ? "⌃"
                          : "⌄"}
                      </button>

                    </div>


                    {isAdmin && (

                      <button
                        type="button"
                        className="master-data-add-button"
                        onClick={() =>
                          handleAddMasterData(
                            "category"
                          )
                        }
                      >
                        + Add Category
                      </button>

                    )}

                  </div>


                  {!categoriesExpanded && (

                    <div className="master-data-card-body">

                      <div className="master-data-search-box">

                        <span className="master-data-search-icon">
                          🔍
                        </span>

                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(event) =>
                            setCategorySearch(
                              event.target.value
                            )
                          }
                          placeholder="Search categories..."
                          aria-label="Search categories"
                        />

                        {categorySearch && (

                          <button
                            type="button"
                            className="master-data-search-clear"
                            onClick={() =>
                              setCategorySearch("")
                            }
                            aria-label="Clear category search"
                          >
                            ×
                          </button>

                        )}

                      </div>


                      <div className="master-data-list">

                        {categories.length === 0 ? (

                          <div className="master-data-empty">
                            No categories available.
                          </div>

                        ) : filteredCategories.length === 0 ? (

                          <div className="master-data-empty">
                            No categories match "
                            {categorySearch}".
                          </div>

                        ) : (

                          filteredCategories.map(
                            (item) => (

                              <div
                                key={item.id}
                                className="master-data-item"
                              >

                                <div className="master-data-item-info">

                                  <div className="master-data-item-icon">
                                    🏷️
                                  </div>

                                  <span>
                                    {item.name}
                                  </span>

                                </div>


                                {isAdmin && (

                                  <div className="master-data-item-actions">

                                    <button
                                      type="button"
                                      className="cashbook-action-button"
                                      onClick={() =>
                                        handleEditMasterData(
                                          "category",
                                          item
                                        )
                                      }
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M12 20h9"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />

                                        <path
                                          d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </button>


                                    <button
                                      type="button"
                                      className="cashbook-action-button cashbook-action-button--danger"
                                      onClick={() =>
                                        setMasterDataDeletePopup({
                                          type: "category",
                                          item,
                                        })
                                      }
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M3 6h18"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />

                                        <path
                                          d="M8 6V4h8v2"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />

                                        <path
                                          d="M19 6l-1 14H6L5 6"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinejoin="round"
                                        />

                                        <path
                                          d="M10 10v6M14 10v6"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </button>

                                  </div>

                                )}

                              </div>

                            )
                          )

                        )}

                      </div>

                    </div>

                  )}

                </div>


                {/* =================================================
                   PAYMENT MODES
                ================================================= */}

                <div className="master-data-card">

                  <div className="master-data-card-header">

                    <div className="master-data-card-title">

                      <div>

                        <h3>
                          Payment Modes
                        </h3>

                        <p>
                          {paymentModes.length}{" "}
                          {paymentModes.length === 1
                            ? "payment mode"
                            : "payment modes"}
                        </p>

                      </div>


                      <button
                        type="button"
                        className="master-data-mobile-toggle"
                        onClick={() =>
                          setPaymentModesExpanded(
                            (previous) =>
                              !previous
                          )
                        }
                        aria-expanded={
                          paymentModesExpanded
                        }
                        aria-label={
                          paymentModesExpanded
                            ? "Collapse payment modes"
                            : "Expand payment modes"
                        }
                      >
                        {paymentModesExpanded
                          ? "⌃"
                          : "⌄"}
                      </button>

                    </div>


                    {isAdmin && (

                      <button
                        type="button"
                        className="master-data-add-button"
                        onClick={() =>
                          handleAddMasterData(
                            "paymentMode"
                          )
                        }
                      >
                        + Add Payment Mode
                      </button>

                    )}

                  </div>


                  {!paymentModesExpanded && (

                    <div className="master-data-card-body">

                      <div className="master-data-search-box">

                        <span className="master-data-search-icon">
                          🔍
                        </span>

                        <input
                          type="text"
                          value={paymentModeSearch}
                          onChange={(event) =>
                            setPaymentModeSearch(
                              event.target.value
                            )
                          }
                          placeholder="Search payment modes..."
                          aria-label="Search payment modes"
                        />

                        {paymentModeSearch && (

                          <button
                            type="button"
                            className="master-data-search-clear"
                            onClick={() =>
                              setPaymentModeSearch("")
                            }
                            aria-label="Clear payment mode search"
                          >
                            ×
                          </button>

                        )}

                      </div>


                      <div className="master-data-list">

                        {paymentModes.length === 0 ? (

                          <div className="master-data-empty">
                            No payment modes available.
                          </div>

                        ) : filteredPaymentModes.length === 0 ? (

                          <div className="master-data-empty">
                            No payment modes match "
                            {paymentModeSearch}".
                          </div>

                        ) : (

                          filteredPaymentModes.map(
                            (item) => (

                              <div
                                key={item.id}
                                className="master-data-item"
                              >

                                <div className="master-data-item-info">

                                  <div className="master-data-item-icon">
                                    💳
                                  </div>

                                  <span>
                                    {item.name}
                                  </span>

                                </div>


                                {isAdmin && (

                                  <div className="master-data-item-actions">

                                    <button
                                      type="button"
                                      className="cashbook-action-button"
                                      onClick={() =>
                                        handleEditMasterData(
                                          "paymentMode",
                                          item
                                        )
                                      }
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M12 20h9"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />

                                        <path
                                          d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </button>


                                    <button
                                      type="button"
                                      className="cashbook-action-button cashbook-action-button--danger"
                                      onClick={() =>
                                        setMasterDataDeletePopup({
                                          type: "paymentMode",
                                          item,
                                        })
                                      }
                                    >
                                      <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M3 6h18"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />

                                        <path
                                          d="M8 6V4h8v2"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />

                                        <path
                                          d="M19 6l-1 14H6L5 6"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinejoin="round"
                                        />

                                        <path
                                          d="M10 10v6M14 10v6"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                    </button>

                                  </div>

                                )}

                              </div>

                            )
                          )

                        )}

                      </div>

                    </div>

                  )}

                </div>

              </div>

            )}

          </>

        )}

      </div>
    );
  }


  /* =====================================================
     COMING SOON
  ===================================================== */

  function renderComingSoon(
    title: string,
    description: string
  ) {

    return (

      <div className="settings-section-content">

        <div className="settings-section-heading">

          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>

        </div>


        <div className="settings-coming-soon">

          <div className="settings-coming-soon-icon">
            ⚙
          </div>

          <h3>
            Coming Soon
          </h3>

          <p>
            This section will be available in a future update.
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <>

      {/* ===================================================
         CREATE CASH BOOK POPUP
      =================================================== */}

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
                      Number(
                        event.target.value
                      )
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


      {/* ===================================================
         MASTER DATA ADD / EDIT POPUP
      =================================================== */}

      {masterDataPopup && (

        <div className="settings-popup-overlay">

          <div className="settings-confirmation-popup">

            <div className="settings-confirmation-icon">
              {masterDataPopup.type === "category"
                ? "🏷️"
                : "💳"}
            </div>


            <h3>

              {masterDataPopup.mode === "create"
                ? `Add ${getMasterDataTitle(
                  masterDataPopup.type
                )}`
                : `Rename ${getMasterDataTitle(
                  masterDataPopup.type
                )}`}

            </h3>


            <p>

              {masterDataPopup.mode === "create"
                ? `Add a new ${getMasterDataTitle(
                  masterDataPopup.type
                ).toLowerCase()} to this Cash Book.`
                : `Update the name of this ${getMasterDataTitle(
                  masterDataPopup.type
                ).toLowerCase()}.`}

            </p>


            {masterDataError && (

              <div
                className="settings-message settings-message--error"
                style={{
                  marginTop: "16px",
                  marginBottom: "0",
                  textAlign: "left",
                }}
              >
                {masterDataError}
              </div>

            )}


            <form
              onSubmit={handleSaveMasterData}
              style={{
                marginTop: "18px",
                textAlign: "left",
              }}
            >

              <div className="settings-create-field">

                <label htmlFor="master-data-name">

                  {getMasterDataTitle(
                    masterDataPopup.type
                  )}{" "}
                  Name

                </label>


                <input
                  id="master-data-name"
                  type="text"
                  value={masterDataName}
                  autoFocus
                  required
                  disabled={masterDataSaving}
                  placeholder={
                    masterDataPopup.type === "category"
                      ? "e.g. Grocery"
                      : "e.g. UPI"
                  }
                  onChange={(event) => {

                    setMasterDataError("");

                    setMasterDataName(
                      event.target.value
                    );

                  }}
                />

              </div>


              <div className="settings-confirmation-actions">

                <button
                  type="button"
                  className="settings-confirmation-cancel"
                  disabled={masterDataSaving}
                  onClick={() => {

                    setMasterDataPopup(null);
                    setMasterDataName("");
                    setMasterDataError("");

                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="settings-create-cashbook-submit"
                  disabled={masterDataSaving}
                >
                  {masterDataSaving
                    ? "Saving..."
                    : masterDataPopup.mode === "create"
                      ? "Add"
                      : "Save"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ===================================================
         MASTER DATA DELETE POPUP
      =================================================== */}

      {masterDataDeletePopup && (

        <div className="settings-popup-overlay">

          <div className="settings-confirmation-popup">

            <div className="settings-confirmation-icon">
              🗑️
            </div>


            <h3>
              Delete{" "}
              {getMasterDataTitle(
                masterDataDeletePopup.type
              )}?
            </h3>


            <p>
              Are you sure you want to delete{" "}
              "{masterDataDeletePopup.item.name}"?
              This item will no longer appear when
              creating new transactions.
            </p>


            {masterDataError && (

              <div className="settings-message settings-message--error">
                {masterDataError}
              </div>

            )}


            <div className="settings-confirmation-actions">

              <button
                type="button"
                className="settings-confirmation-cancel"
                disabled={masterDataSaving}
                onClick={() =>
                  setMasterDataDeletePopup(null)
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="settings-confirmation-danger"
                disabled={masterDataSaving}
                onClick={
                  executeDeleteMasterData
                }
              >
                {masterDataSaving
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ===================================================
         CASH BOOK DELETE / LEAVE POPUP
      =================================================== */}

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
                onClick={() =>
                  setConfirmationPopup(null)
                }
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

                  const group =
                    confirmationPopup.group;

                  const type =
                    confirmationPopup.type;

                  setConfirmationPopup(null);

                  if (type === "delete") {

                    await executeDeleteGroup(
                      group
                    );

                  } else {

                    await handleLeaveGroup(
                      group
                    );

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


      {/* ===================================================
         MAIN SETTINGS PAGE
      =================================================== */}

      <div className="settings-page">

        <div className="settings-header">

          <div>

            <h1>
              Settings
            </h1>

            <p>
              Manage your account and application preferences.
            </p>

          </div>

        </div>


        <div className="settings-layout">

          {/* =================================================
             SIDEBAR
          ================================================= */}

          <aside className="settings-sidebar">

            <button
              type="button"
              className={`settings-nav-item ${activeSection === "profile"
                ? "settings-nav-item--active"
                : ""
                }`}
              onClick={() =>
                handleSectionChange(
                  "profile"
                )
              }
            >

              <span className="settings-nav-icon">
                👤
              </span>

              <span className="settings-nav-text">

                <strong>
                  Profile
                </strong>

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
                handleSectionChange(
                  "cashbooks"
                )
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
              className={`settings-nav-item ${activeSection === "masterdata"
                ? "settings-nav-item--active"
                : ""
                }`}
              onClick={() =>
                handleSectionChange(
                  "masterdata"
                )
              }
            >

              <span className="settings-nav-icon">
                🏷️
              </span>

              <span className="settings-nav-text">

                <strong>
                  Categories & Modes
                </strong>

                <small>
                  Manage master data
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
                handleSectionChange(
                  "security"
                )
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
                handleSectionChange(
                  "preferences"
                )
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


          {/* =================================================
             CONTENT
          ================================================= */}

          <main className="settings-card">

            {activeSection === "profile" &&
              renderProfileSection()}


            {activeSection === "cashbooks" &&
              renderCashBooksSection()}


            {activeSection === "masterdata" &&
              renderMasterDataSection()}


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
