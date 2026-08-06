import {
//   FormEvent,
  useState,
} from "react";

import {
  createCashBookGroup,
} from "../services/cashBookService";

type CashBookSetupPageProps = {
  defaultOwnerName: string;
  onGroupCreated: (
    groupId: string
  ) => void;
};

function CashBookSetupPage({
  defaultOwnerName,
  onGroupCreated,
}: CashBookSetupPageProps) {
  const [cashBookName, setCashBookName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    ownerName,
    setOwnerName,
  ] = useState(defaultOwnerName);

  const [
    openingBalance,
    setOpeningBalance,
  ] = useState("0");

  const [loading, setLoading] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setErrorMessage("");

    const trimmedCashBookName =
      cashBookName.trim();

    const trimmedOwnerName =
      ownerName.trim();

    const parsedOpeningBalance =
      Number(openingBalance);

    if (!trimmedCashBookName) {
      setErrorMessage(
        "Please enter a cash book name."
      );
      return;
    }

    if (!trimmedOwnerName) {
      setErrorMessage(
        "Please enter the owner name."
      );
      return;
    }

    if (
      Number.isNaN(
        parsedOpeningBalance
      )
    ) {
      setErrorMessage(
        "Opening balance must be a valid number."
      );
      return;
    }

    if (
      parsedOpeningBalance < 0
    ) {
      setErrorMessage(
        "Opening balance cannot be negative."
      );
      return;
    }

    try {
      setLoading(true);

      const groupId =
        await createCashBookGroup({
          name:
            trimmedCashBookName,
          description:
            description.trim(),
          currencyCode:
            "INR",
          openingBalance:
            parsedOpeningBalance,
          ownerName:
            trimmedOwnerName,
        });

      onGroupCreated(groupId);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create the cash book.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "32px",
          border:
            "1px solid #d1d5db",
          borderRadius: "16px",
        }}
      >
        <h1>
          Create Your Cash Book
        </h1>

        <p>
          Set up your family cash book.
          You will become the group
          administrator.
        </p>

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom:
                "16px",
              padding: "12px",
              border:
                "1px solid #dc2626",
              borderRadius:
                "8px",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
        >
          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <label
              htmlFor="cashBookName"
            >
              Cash Book Name
            </label>

            <input
              id="cashBookName"
              type="text"
              value={cashBookName}
              onChange={(
                event
              ) => {
                setCashBookName(
                  event.target.value
                );
              }}
              placeholder={
                "Parekh Family Cash Book"
              }
              disabled={loading}
              required
              style={{
                width: "100%",
                marginTop:
                  "6px",
                padding:
                  "12px",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <label
              htmlFor="description"
            >
              Description
              {" "}
              (Optional)
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(
                event
              ) => {
                setDescription(
                  event.target.value
                );
              }}
              placeholder={
                "Family daily income and expenses"
              }
              disabled={loading}
              rows={3}
              style={{
                width: "100%",
                marginTop:
                  "6px",
                padding:
                  "12px",
                boxSizing:
                  "border-box",
                resize:
                  "vertical",
              }}
            />
          </div>

          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <label
              htmlFor="ownerName"
            >
              Owner Name
            </label>

            <input
              id="ownerName"
              type="text"
              value={ownerName}
              onChange={(
                event
              ) => {
                setOwnerName(
                  event.target.value
                );
              }}
              disabled={loading}
              required
              style={{
                width: "100%",
                marginTop:
                  "6px",
                padding:
                  "12px",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <label
              htmlFor="currency"
            >
              Currency
            </label>

            <input
              id="currency"
              type="text"
              value="INR (₹)"
              disabled
              style={{
                width: "100%",
                marginTop:
                  "6px",
                padding:
                  "12px",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <label
              htmlFor="openingBalance"
            >
              Opening Balance
            </label>

            <input
              id="openingBalance"
              type="number"
              value={openingBalance}
              onChange={(
                event
              ) => {
                setOpeningBalance(
                  event.target.value
                );
              }}
              min="0"
              step="0.01"
              disabled={loading}
              required
              style={{
                width: "100%",
                marginTop:
                  "6px",
                padding:
                  "12px",
                boxSizing:
                  "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding:
                "12px",
              cursor:
                loading
                  ? "wait"
                  : "pointer",
            }}
          >
            {loading
              ? "Creating Cash Book..."
              : "Create Cash Book"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default CashBookSetupPage;