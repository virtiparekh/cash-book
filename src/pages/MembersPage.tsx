import "./../styles/MembersPage.css";

import {
    useEffect,
    useState,
} from "react";

import {
    useCashBook,
} from "../hooks/useCashBook";

import {
    getGroupMembers,
    addGroupMember,
    updateMemberName,
    updateMemberStatus,
    updateMemberRole
} from "../services/memberService";

import type {
    GroupMember,
} from "../types/member";

import EditMemberModal
    from "../components/members/EditMemberModal/EditMemberModal";

import InviteMemberModal
    from "../components/members/InviteMemberModal/InviteMemberModal";

import Popup
    from "../components/common/Popup/Popup";

import {
    createGroupInvitation,
    getGroupInvitations,
    cancelGroupInvitation,
} from "../services/invitationService";

import type {
    GroupInvitation
} from "../services/invitationService";

import {
    appPath
} from "../utils/appUrl";


/*
 * -------------------------------------------------
 * Popup Types
 * -------------------------------------------------
 */

type PopupState = {

    open: boolean;

    variant: "error" | "success";

    title: string;

    message: string;

    confirmAction?: () => void;

    confirmButtonText?: string;

} | null;


function MembersPage() {

    const [
        invitationLink,
        setInvitationLink
    ] = useState<string | null>(null);


    const [
        invitationCopied,
        setInvitationCopied
    ] = useState(false);


    const [
        copiedInvitationId,
        setCopiedInvitationId
    ] = useState<string | null>(null);


    const {
        selectedCashBook,
        currentMember
    } = useCashBook();


    const isAdmin =
        currentMember?.role === "admin";


    const [
        members,
        setMembers,
    ] = useState<GroupMember[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    const [
        showAddMemberModal,
        setShowAddMemberModal,
    ] = useState(false);


    const [
        memberName,
        setMemberName,
    ] = useState("");


    const [
        addingMember,
        setAddingMember,
    ] = useState(false);


    const [
        addMemberError,
        setAddMemberError,
    ] = useState<string | null>(null);


    const [
        editingMember,
        setEditingMember,
    ] = useState<GroupMember | null>(
        null
    );


    const [
        editSaving,
        setEditSaving,
    ] = useState(false);


    const [
        inviteModalOpen,
        setInviteModalOpen,
    ] = useState(false);


    const [
        inviteLoading,
    ] = useState(false);


    const [
        invitations,
        setInvitations,
    ] = useState<GroupInvitation[]>([]);


    const [
        invitationsLoading,
        setInvitationsLoading,
    ] = useState(false);


    const [
        cancellingInvitationId,
        setCancellingInvitationId,
    ] = useState<string | null>(null);


    /*
     * -------------------------------------------------
     * Popup State
     * -------------------------------------------------
     */

    const [
        popup,
        setPopup,
    ] = useState<PopupState>(null);


    /*
     * -------------------------------------------------
     * Close Popup
     * -------------------------------------------------
     */

    const handleClosePopup = () => {

        setPopup(null);

    };


    /*
     * -------------------------------------------------
     * Show Error Popup
     * -------------------------------------------------
     */

    const showErrorPopup = (
        title: string,
        message: string
    ) => {

        setPopup({

            open: true,

            variant: "error",

            title,

            message,

        });

    };


    /*
     * -------------------------------------------------
     * Show Confirmation Popup
     * -------------------------------------------------
     */

    const showConfirmationPopup = (
        title: string,
        message: string,
        confirmAction: () => void,
        confirmButtonText = "Confirm"
    ) => {

        setPopup({

            open: true,

            variant: "error",

            title,

            message,

            confirmAction,

            confirmButtonText,

        });

    };


    /*
     * -------------------------------------------------
     * Load Invitations
     * -------------------------------------------------
     */

    useEffect(() => {

        let cancelled = false;


        const loadInvitations = async () => {

            if (!selectedCashBook?.id) {

                setInvitations([]);

                return;

            }


            try {

                setInvitationsLoading(true);


                const data =
                    await getGroupInvitations(
                        selectedCashBook.id
                    );


                if (!cancelled) {

                    const now = new Date();


                    const activeInvitations =
                        data.filter(
                            (invitation) => {

                                if (
                                    invitation.status !==
                                    "pending"
                                ) {

                                    return false;

                                }


                                return (
                                    new Date(
                                        invitation.expires_at
                                    ) > now
                                );

                            }
                        );


                    setInvitations(
                        activeInvitations
                    );

                }

            } catch (error) {

                console.error(
                    "Unable to load invitations.",
                    error
                );


                if (!cancelled) {

                    setInvitations([]);

                }

            } finally {

                if (!cancelled) {

                    setInvitationsLoading(false);

                }

            }

        };


        void loadInvitations();


        return () => {

            cancelled = true;

        };

    }, [
        selectedCashBook?.id,
    ]);


    /*
     * -------------------------------------------------
     * Load Members
     * -------------------------------------------------
     */

    useEffect(() => {

        let cancelled = false;


        const loadMembers = async () => {

            if (!selectedCashBook?.id) {

                setMembers([]);

                setLoading(false);

                return;

            }


            try {

                setLoading(true);

                setError(null);


                const data =
                    await getGroupMembers(
                        selectedCashBook.id
                    );


                if (!cancelled) {

                    setMembers(data);

                }

            } catch (error) {

                console.error(
                    "Unable to load members.",
                    error
                );


                if (!cancelled) {

                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load members."
                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        void loadMembers();


        return () => {

            cancelled = true;

        };

    }, [
        selectedCashBook?.id,
    ]);


    /*
     * -------------------------------------------------
     * Add Member
     * -------------------------------------------------
     */

    const handleAddMember = async () => {

        if (!selectedCashBook?.id) {

            setAddMemberError(
                "No Cash Book is selected."
            );

            return;

        }


        const cleanName =
            memberName.trim();


        if (!cleanName) {

            setAddMemberError(
                "Member name is required."
            );

            return;

        }


        try {

            setAddingMember(true);

            setAddMemberError(null);


            await addGroupMember(
                selectedCashBook.id,
                cleanName
            );


            setMemberName("");

            setShowAddMemberModal(false);


            const data =
                await getGroupMembers(
                    selectedCashBook.id
                );


            setMembers(data);

        } catch (error) {

            console.error(
                "Unable to add member.",
                error
            );


            setAddMemberError(
                error instanceof Error
                    ? error.message
                    : "Unable to add member."
            );

        } finally {

            setAddingMember(false);

        }

    };


    /*
     * -------------------------------------------------
     * Edit Member
     * -------------------------------------------------
     */

    const handleEditMember = (
        member: GroupMember
    ) => {

        setEditingMember(member);

    };


    const handleCloseEditMember = () => {

        if (editSaving) {

            return;

        }


        setEditingMember(null);

    };


    const handleSaveMember = async (
        memberName: string
    ) => {

        if (!editingMember) {

            return;

        }


        try {

            setEditSaving(true);


            const updatedMember =
                await updateMemberName(
                    editingMember.id,
                    memberName
                );


            setMembers(
                (currentMembers) =>
                    currentMembers.map(
                        (member) =>
                            member.id ===
                                updatedMember.id
                                ? updatedMember
                                : member
                    )
            );


            setEditingMember(null);

        } catch (error) {

            console.error(
                "Unable to update member name.",
                error
            );


            showErrorPopup(
                "Update Member Error",
                error instanceof Error
                    ? error.message
                    : "Unable to update member name."
            );

        } finally {

            setEditSaving(false);

        }

    };


    /*
     * -------------------------------------------------
     * Toggle Member Status
     * -------------------------------------------------
     */

    const handleToggleMemberStatus = (
        member: GroupMember
    ) => {

        const nextStatus =
            !member.is_active;


        const actionText =
            nextStatus
                ? "activate"
                : "deactivate";


        showConfirmationPopup(

            nextStatus
                ? "Activate Member"
                : "Deactivate Member",

            `Are you sure you want to ${actionText} ${member.member_name}?`,

            () => {

                void performToggleMemberStatus(
                    member,
                    nextStatus
                );

            },

            nextStatus
                ? "Activate"
                : "Deactivate"

        );

    };


    const performToggleMemberStatus = async (
        member: GroupMember,
        nextStatus: boolean
    ) => {

        setPopup(null);


        try {

            await updateMemberStatus(
                member.id,
                nextStatus
            );


            setMembers(
                (currentMembers) =>
                    currentMembers.map(
                        (currentMember) =>
                            currentMember.id ===
                                member.id
                                ? {
                                    ...currentMember,
                                    is_active:
                                        nextStatus,
                                }
                                : currentMember
                    )
            );

        } catch (error) {

            console.error(
                "Unable to update member status.",
                error
            );


            showErrorPopup(
                "Member Status Error",
                error instanceof Error
                    ? error.message
                    : "Unable to update member status."
            );

        }

    };


    /*
     * -------------------------------------------------
     * Toggle Member Role
     * -------------------------------------------------
     */

    const handleToggleMemberRole = (
        member: GroupMember
    ) => {

        const nextRole =
            member.role === "admin"
                ? "member"
                : "admin";


        const actionText =
            nextRole === "admin"
                ? "promote"
                : "demote";


        showConfirmationPopup(

            nextRole === "admin"
                ? "Promote Member"
                : "Demote Admin",

            `Are you sure you want to ${actionText} ${member.member_name} ${nextRole === "admin"
                ? "to Admin"
                : "to Member"
            }?`,

            () => {

                void performToggleMemberRole(
                    member,
                    nextRole
                );

            },

            nextRole === "admin"
                ? "Make Admin"
                : "Make Member"

        );

    };


    const performToggleMemberRole = async (
        member: GroupMember,
        nextRole: "admin" | "member"
    ) => {

        setPopup(null);


        try {

            const updatedMember =
                await updateMemberRole(
                    member.id,
                    nextRole
                );


            setMembers(
                (currentMembers) =>
                    currentMembers.map(
                        (currentMember) =>
                            currentMember.id ===
                                member.id
                                ? updatedMember
                                : currentMember
                    )
            );

        } catch (error) {

            console.error(
                "Unable to update member role.",
                error
            );


            showErrorPopup(
                "Member Role Error",
                error instanceof Error
                    ? error.message
                    : "Unable to update member role."
            );

        }

    };


    /*
     * -------------------------------------------------
     * Refresh Invitations
     * -------------------------------------------------
     */

    const refreshInvitations = async () => {

        if (
            !selectedCashBook?.id ||
            currentMember?.role !== "admin"
        ) {

            setInvitations([]);

            return;

        }


        try {

            setInvitationsLoading(true);


            const data =
                await getGroupInvitations(
                    selectedCashBook.id
                );


            setInvitations(data);

        } catch (error) {

            console.error(
                "Unable to refresh invitations.",
                error
            );

        } finally {

            setInvitationsLoading(false);

        }

    };


    /*
     * -------------------------------------------------
     * Cancel Invitation
     * -------------------------------------------------
     */

    const handleCancelInvitation = (
        invitation: GroupInvitation
    ) => {

        showConfirmationPopup(

            "Cancel Invitation",

            `Cancel invitation for ${invitation.member_name}?`,

            () => {

                void performCancelInvitation(
                    invitation
                );

            },

            "Cancel Invitation"

        );

    };


    const performCancelInvitation = async (
        invitation: GroupInvitation
    ) => {

        setPopup(null);


        try {

            setCancellingInvitationId(
                invitation.id
            );


            await cancelGroupInvitation(
                invitation.id
            );


            await refreshInvitations();

        } catch (error) {

            console.error(
                "Unable to cancel invitation.",
                error
            );


            showErrorPopup(
                "Cancel Invitation Error",
                error instanceof Error
                    ? error.message
                    : "Unable to cancel invitation."
            );

        } finally {

            setCancellingInvitationId(
                null
            );

        }

    };


    /*
     * -------------------------------------------------
     * Create Invitation
     * -------------------------------------------------
     */

    const handleCreateInvitation = async (
        memberName: string,
        email?: string,
        phone?: string
    ) => {

        if (!selectedCashBook?.id) {

            return;

        }


        try {

            const invitation =
                await createGroupInvitation(
                    selectedCashBook.id,
                    memberName,
                    email,
                    phone
                );


            const link =
                `${window.location.origin}${appPath(
                    `/invite?token=${invitation.token}`
                )}`;


            setInvitationLink(link);

            setInvitationCopied(false);


            await refreshInvitations();

        } catch (error) {

            console.error(
                "Unable to create invitation.",
                error
            );


            showErrorPopup(
                "Invitation Error",
                error instanceof Error
                    ? error.message
                    : "Unable to create invitation."
            );

        }

    };


    /*
     * -------------------------------------------------
     * Copy New Invitation Link
     * -------------------------------------------------
     */

    const handleCopyInvitationLink = async () => {

        if (!invitationLink) {

            return;

        }


        try {

            await navigator.clipboard.writeText(
                invitationLink
            );


            setInvitationCopied(true);


            setTimeout(() => {

                setInvitationCopied(false);

            }, 2000);

        } catch (error) {

            console.error(
                "Unable to copy invitation link.",
                error
            );


            showErrorPopup(
                "Copy Link Error",
                "Unable to copy the invitation link."
            );

        }

    };


    /*
     * -------------------------------------------------
     * Format Invitation Date
     * -------------------------------------------------
     */

    function formatInvitationDate(
        date: string
    ) {

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        )
            .format(
                new Date(date)
            )
            .replace(
                /(\d{2})\s([A-Za-z]{3})\s(\d{4})/,
                "$2 $1, $3"
            );

    }


    /*
     * -------------------------------------------------
     * Pending Invitations
     * -------------------------------------------------
     */

    const pendingInvitations =
        invitations.filter(
            (invitation) =>
                invitation.status === "pending"
        );


    /*
     * -------------------------------------------------
     * Loading
     * -------------------------------------------------
     */

    if (loading) {

        return (

            <section className="members-page">

                <div className="members-header">

                    <div>

                        <h1>
                            Members
                        </h1>

                        <p>
                            Manage people who use
                            this Cash Book.
                        </p>

                    </div>

                </div>


                <div className="members-loading">

                    Loading members...

                </div>

            </section>

        );

    }


    /*
     * -------------------------------------------------
     * Error
     * -------------------------------------------------
     */

    if (error) {

        return (

            <section className="members-page">

                <div className="members-header">

                    <div>

                        <h1>
                            Members
                        </h1>

                        <p>
                            Manage people who use
                            this Cash Book.
                        </p>

                    </div>

                </div>


                <div className="members-error">

                    {error}

                </div>

            </section>

        );

    }


    return (

        <section className="members-page">


            {/* -----------------------------------------
                Members Header
            ----------------------------------------- */}

            <div className="members-header">

                <div>

                    <h1>
                        Members
                    </h1>

                    <p>
                        Manage people who use
                        this Cash Book.
                    </p>

                </div>


                {isAdmin && (

                    <button
                        type="button"
                        className="add-member-button"
                        onClick={() =>
                            setInviteModalOpen(true)
                        }
                    >

                        + Invite Member

                    </button>

                )}

            </div>


            {/* -----------------------------------------
                Members Card
            ----------------------------------------- */}

            <div className="members-card">

                {members.length === 0 ? (

                    <div className="members-empty">

                        <div className="members-empty-icon">
                            👥
                        </div>

                        <h3>
                            No Members Found
                        </h3>

                        <p>
                            Add a member to start
                            managing your Cash Book.
                        </p>

                    </div>

                ) : (

                    <div className="members-list">

                        {members.map(
                            (member) => (

                                <div
                                    className="member-row"
                                    key={member.id}
                                >

                                    <div className="member-avatar">

                                        {member.member_name
                                            .charAt(0)
                                            .toUpperCase()}

                                    </div>


                                    <div className="member-info">

                                        <div className="member-name">

                                            {member.member_name}

                                        </div>


                                        {isAdmin && (

                                            <div className="member-status">

                                                {member.user_id
                                                    ? "Registered user"
                                                    : "Not linked to an account"}

                                            </div>

                                        )}

                                    </div>

                                    <div className="member-actions">

                                        <div className="member-top-actions">

                                            <div
                                                className={`member-role member-role--${member.role}`}
                                            >
                                                {member.role}
                                            </div>

                                            {isAdmin && (
                                                <div className="member-status-badge">
                                                    {member.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </div>
                                            )}

                                            {isAdmin && (
                                                <button
                                                    type="button"
                                                    className="member-edit-button"
                                                    onClick={() =>
                                                        handleEditMember(member)
                                                    }
                                                    title={`Edit ${member.member_name}`}
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
                                            )}

                                        </div>


                                        <div className="member-bottom-actions">

                                            {isAdmin && (
                                                member.role === "admin"
                                                    ? (
                                                        <button
                                                            type="button"
                                                            className="member-action-button member-action-button--demote"
                                                            onClick={() =>
                                                                handleToggleMemberRole(member)
                                                            }
                                                        >
                                                            Make Member
                                                        </button>
                                                    )
                                                    : (
                                                        <button
                                                            type="button"
                                                            className="member-action-button member-action-button--promote"
                                                            onClick={() =>
                                                                handleToggleMemberRole(member)
                                                            }
                                                        >
                                                            Make Admin
                                                        </button>
                                                    )
                                            )}

                                            {isAdmin &&
                                                member.role === "member" && (
                                                    <button
                                                        type="button"
                                                        className={
                                                            member.is_active
                                                                ? "member-action-button member-action-button--deactivate"
                                                                : "member-action-button member-action-button--activate"
                                                        }
                                                        onClick={() =>
                                                            handleToggleMemberStatus(member)
                                                        }
                                                    >
                                                        {member.is_active
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>
                                                )}

                                        </div>

                                    </div>
                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* -----------------------------------------
                Pending Invitations
            ----------------------------------------- */}

            {isAdmin && (

                <div className="invitations-section">

                    <div className="invitations-header">

                        <div>

                            <h2>
                                Pending Invitations
                            </h2>

                            <p>
                                Invitations that are
                                waiting to be accepted.
                            </p>

                        </div>


                        {pendingInvitations.length > 0 && (

                            <span className="invitation-count">

                                {pendingInvitations.length}

                            </span>

                        )}

                    </div>


                    <div className="invitations-card">

                        {invitationsLoading ? (

                            <div className="invitations-loading">

                                Loading invitations...

                            </div>

                        ) : pendingInvitations.length === 0 ? (

                            <div className="invitations-empty">

                                <div className="invitations-empty-icon">
                                    ✉
                                </div>

                                <h3>
                                    No Pending Invitations
                                </h3>

                                <p>
                                    Invitations you create
                                    will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="invitations-list">

                                {pendingInvitations.map(
                                    (invitation) => (

                                        <div
                                            className="invitation-row"
                                            key={invitation.id}
                                        >

                                            <div className="invitation-avatar">

                                                {invitation.member_name
                                                    .charAt(0)
                                                    .toUpperCase()}

                                            </div>


                                            <div className="invitation-info">

                                                <div className="invitation-name">

                                                    {invitation.member_name}

                                                </div>


                                                <div className="invitation-email">

                                                    {invitation.email}

                                                </div>

                                            </div>


                                            <div className="invitation-status">

                                                Pending

                                            </div>


                                            <div className="invitation-expiry">

                                                Expires{" "}

                                                {formatInvitationDate(
                                                    invitation.expires_at
                                                )}

                                            </div>


                                            <button
                                                type="button"
                                                className="copy-existing-invitation-button"
                                                onClick={async () => {

                                                    const link =
                                                        `${window.location.origin}${appPath(
                                                            `/invite?token=${invitation.token}`
                                                        )}`;


                                                    try {

                                                        await navigator.clipboard.writeText(
                                                            link
                                                        );


                                                        setCopiedInvitationId(
                                                            invitation.id
                                                        );


                                                        setTimeout(() => {

                                                            setCopiedInvitationId(
                                                                null
                                                            );

                                                        }, 2000);

                                                    } catch (error) {

                                                        console.error(
                                                            "Unable to copy invitation link.",
                                                            error
                                                        );


                                                        showErrorPopup(
                                                            "Copy Link Error",
                                                            "Unable to copy the invitation link."
                                                        );

                                                    }

                                                }}
                                            >

                                                {copiedInvitationId ===
                                                    invitation.id

                                                    ? "✓ Copied"

                                                    : "Copy Link"}

                                            </button>


                                            <button
                                                type="button"
                                                className="cancel-invitation-button"
                                                onClick={() =>
                                                    handleCancelInvitation(
                                                        invitation
                                                    )
                                                }
                                                disabled={
                                                    cancellingInvitationId ===
                                                    invitation.id
                                                }
                                            >

                                                {cancellingInvitationId ===
                                                    invitation.id

                                                    ? "Cancelling..."

                                                    : "Cancel"}

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* -----------------------------------------
                Add Member Modal
            ----------------------------------------- */}

            {showAddMemberModal && (

                <div className="member-modal-overlay">

                    <div
                        className="member-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-member-title"
                    >

                        <div className="member-modal-header">

                            <div>

                                <h2 id="add-member-title">
                                    Add Member
                                </h2>

                                <p>
                                    Add a person to this
                                    Cash Book.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="member-modal-close"
                                onClick={() => {

                                    if (!addingMember) {

                                        setShowAddMemberModal(
                                            false
                                        );

                                    }

                                }}
                                disabled={addingMember}
                                aria-label="Close"
                            >

                                ×

                            </button>

                        </div>


                        <div className="member-modal-body">

                            <label
                                htmlFor="member-name"
                                className="member-modal-label"
                            >

                                Member Name

                            </label>


                            <input
                                id="member-name"
                                type="text"
                                value={memberName}
                                onChange={(event) =>
                                    setMemberName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter member name"
                                maxLength={100}
                                autoFocus
                                disabled={addingMember}
                            />


                            {addMemberError && (

                                <div className="member-modal-error">

                                    {addMemberError}

                                </div>

                            )}

                        </div>


                        <div className="member-modal-footer">

                            <button
                                type="button"
                                className="member-modal-cancel"
                                onClick={() => {

                                    if (!addingMember) {

                                        setShowAddMemberModal(
                                            false
                                        );

                                    }

                                }}
                                disabled={addingMember}
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="member-modal-submit"
                                onClick={handleAddMember}
                                disabled={
                                    addingMember ||
                                    !memberName.trim()
                                }
                            >

                                {addingMember
                                    ? "Adding..."
                                    : "Add Member"}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* -----------------------------------------
                Edit Member Modal
            ----------------------------------------- */}

            <EditMemberModal
                member={editingMember}
                open={editingMember !== null}
                saving={editSaving}
                onClose={handleCloseEditMember}
                onSave={handleSaveMember}
            />


            {/* -----------------------------------------
                Invite Member Modal
            ----------------------------------------- */}

            <InviteMemberModal
                open={inviteModalOpen}
                loading={inviteLoading}
                onClose={() =>
                    setInviteModalOpen(false)
                }
                onSubmit={
                    handleCreateInvitation
                }
            />


            {/* -----------------------------------------
                Invitation Link Modal
            ----------------------------------------- */}

            {invitationLink && (

                <div className="invitation-link-modal-overlay">

                    <div
                        className="invitation-link-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="invitation-link-title"
                    >

                        <div className="invitation-link-modal-header">

                            <div>

                                <h2 id="invitation-link-title">
                                    Invitation Created
                                </h2>

                                <p>
                                    Copy this link and
                                    share it with the member.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="invitation-link-close"
                                onClick={() => {

                                    setInvitationLink(null);

                                    setInvitationCopied(false);

                                }}
                                aria-label="Close"
                            >

                                ×

                            </button>

                        </div>


                        <div className="invitation-link-modal-body">

                            <label
                                htmlFor="invitation-link"
                                className="invitation-link-label"
                            >

                                Invitation Link

                            </label>


                            <div className="invitation-link-row">

                                <input
                                    id="invitation-link"
                                    type="text"
                                    value={invitationLink}
                                    readOnly
                                />


                                <button
                                    type="button"
                                    className="invitation-copy-button"
                                    onClick={
                                        handleCopyInvitationLink
                                    }
                                >

                                    {invitationCopied
                                        ? "Copied!"
                                        : "Copy Link"}

                                </button>

                            </div>


                            <p className="invitation-link-help">

                                This link can be shared
                                through WhatsApp, SMS,
                                email, or any other
                                messaging app.

                            </p>

                        </div>


                        <div className="invitation-link-modal-footer">

                            <button
                                type="button"
                                className="invitation-link-done-button"
                                onClick={() => {

                                    setInvitationLink(null);

                                    setInvitationCopied(false);

                                    setInviteModalOpen(false);

                                    void refreshInvitations();

                                }}
                            >

                                Done

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* -----------------------------------------
                Common Popup
            ----------------------------------------- */}

            {popup?.open && (

                <Popup
                    variant={popup.variant}
                    title={popup.title}
                    onClose={handleClosePopup}
                >

                    <div className="members-popup-content">

                        <p>
                            {popup.message}
                        </p>


                        {popup.confirmAction && (

                            <div
                                className="members-popup-actions"
                            >

                                <button
                                    type="button"
                                    className="member-modal-cancel"
                                    onClick={
                                        handleClosePopup
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    className="member-modal-submit"
                                    onClick={() => {
                                        popup.confirmAction?.();
                                    }}
                                >

                                    {popup.confirmButtonText ??
                                        "Confirm"}

                                </button>

                            </div>

                        )}

                    </div>

                </Popup>

            )}

        </section>

    );

}

export default MembersPage;