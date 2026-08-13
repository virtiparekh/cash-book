import "./EditMemberModal.css";

import {
  useEffect,
  useState,
} from "react";

import type {
  GroupMember,
} from "../../../types/member";

type EditMemberModalProps = {
  member: GroupMember | null;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (memberName: string) => Promise<void>;
};

function EditMemberModal({
  member,
  open,
  saving,
  onClose,
  onSave,
}: EditMemberModalProps) {

  const [
    memberName,
    setMemberName,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {

    if (member) {

      setMemberName(
        member.member_name
      );

      setError(null);

    }

  }, [member]);

  if (!open || !member) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    const cleanName =
      memberName.trim();

    if (!cleanName) {

      setError(
        "Member name cannot be empty."
      );

      return;
    }

    if (cleanName.length < 2) {

      setError(
        "Member name must contain at least 2 characters."
      );

      return;
    }

    try {

      setError(null);

      await onSave(cleanName);

    } catch (error) {

      console.error(
        "Unable to update member.",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update member."
      );

    }

  };

  return (

    <div
      className="edit-member-overlay"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div
        className="edit-member-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-member-title"
      >

        <div className="edit-member-header">

          <div>

            <h2 id="edit-member-title">
              Edit Member
            </h2>

            <p>
              Update the member name.
            </p>

          </div>

          <button
            type="button"
            className="edit-member-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
        >

          <div className="edit-member-body">

            <label
              htmlFor="edit-member-name"
            >
              Member Name
            </label>

            <input
              id="edit-member-name"
              type="text"
              value={memberName}
              onChange={(event) =>
                setMemberName(
                  event.target.value
                )
              }
              placeholder="Enter member name"
              autoFocus
              disabled={saving}
            />

            {error && (

              <div className="edit-member-error">
                {error}
              </div>

            )}

          </div>


          <div className="edit-member-footer">

            <button
              type="button"
              className="edit-member-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-member-save"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default EditMemberModal;