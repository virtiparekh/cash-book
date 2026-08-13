import "./InviteMemberModal.css";

import {
  useState,
} from "react";

type InviteMemberModalProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    memberName: string,
    email?: string,
    phone?: string
  ) => Promise<void>;
};

function InviteMemberModal({
  open,
  loading = false,
  onClose,
  onSubmit,
}: InviteMemberModalProps) {

  const [
    memberName,
    setMemberName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [inviteMethod, setInviteMethod] =
    useState<"email" | "phone">("email");

  const [phone, setPhone] =
    useState("");

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  if (!open) {
    return null;
  }


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError(null);


    const cleanName =
      memberName.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanPhone =
      phone.trim();

    if (!cleanName) {

      setError(
        "Member name is required."
      );

      return;
    }


    /* ---------------------------------------------
       Email validation
    --------------------------------------------- */

    if (inviteMethod === "email") {

      if (!cleanEmail) {

        setError(
          "Email address is required."
        );

        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          cleanEmail
        )
      ) {

        setError(
          "Enter a valid email address."
        );

        return;
      }

    }


    /* ---------------------------------------------
       Phone validation
    --------------------------------------------- */

    if (inviteMethod === "phone") {

      if (!cleanPhone) {

        setError(
          "Phone number is required."
        );

        return;
      }

      if (
        !/^[6-9][0-9]{9}$/.test(
          cleanPhone
        )
      ) {

        setError(
          "Enter a valid 10-digit Indian mobile number."
        );

        return;
      }

    }


    try {

      await onSubmit(
        cleanName,
        inviteMethod === "email"
          ? cleanEmail
          : undefined,
        inviteMethod === "phone"
          ? cleanPhone
          : undefined
      );

      setMemberName("");
      setEmail("");

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create invitation."
      );

    }

  };


  const handleClose = () => {

    if (loading) {
      return;
    }

    setMemberName("");
    setEmail("");
    setPhone("");
    setInviteMethod("email");
    setError(null);

    onClose();

  };


  return (

    <div className="invite-modal-backdrop">

      <div
        className="invite-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
      >

        <div className="invite-modal-header">

          <div>

            <h2 id="invite-member-title">
              Invite Member
            </h2>

            <p>
              Send an invitation to join this Cash Book.
            </p>

          </div>


          <button
            type="button"
            className="invite-modal-close"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        <form
          className="invite-modal-form"
          onSubmit={handleSubmit}
        >

          <div className="invite-form-field">

            <label htmlFor="invite-member-name">
              Member Name
            </label>

            <input
              id="invite-member-name"
              type="text"
              value={memberName}
              onChange={(event) =>
                setMemberName(
                  event.target.value
                )
              }
              placeholder="Enter member name"
              disabled={loading}
              autoFocus
            />

          </div>


          <div className="invite-method-section">

            <label>
              Invite using
            </label>

            <div className="invite-method-options">

              <label className="invite-method-option">

                <input
                  type="radio"
                  name="inviteMethod"
                  value="email"
                  checked={
                    inviteMethod === "email"
                  }
                  onChange={() =>
                    setInviteMethod("email")
                  }
                />

                <span>
                  Email
                </span>

              </label>


              <label className="invite-method-option">

                <input
                  type="radio"
                  name="inviteMethod"
                  value="phone"
                  checked={
                    inviteMethod === "phone"
                  }
                  onChange={() =>
                    setInviteMethod("phone")
                  }
                />

                <span>
                  Phone
                </span>

              </label>

            </div>

          </div>
          {inviteMethod === "email" ? (

            <div className="invite-form-field">

              <label htmlFor="member-email">
                Email Address
              </label>

              <input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="member@example.com"
              />

            </div>

          ) : (

            <div className="invite-form-field">

              <label htmlFor="member-phone">
                Phone Number
              </label>

              <input
                id="member-phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
              />

            </div>

          )}
          {error && (

            <div className="invite-form-error">
              {error}
            </div>

          )}


          <div className="invite-modal-actions">

            <button
              type="button"
              className="invite-cancel-button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="invite-submit-button"
              disabled={loading}
            >

              {loading
                ? "Creating..."
                : "Create Invitation"
              }

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default InviteMemberModal;