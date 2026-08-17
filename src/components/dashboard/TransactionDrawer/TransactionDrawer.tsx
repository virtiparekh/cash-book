import {
  useEffect,
  useState,
} from "react";

import "./TransactionDrawer.css";

import TransactionForm
  from "./TransactionForm";

import {
  saveTransaction,
  updateTransaction,
} from "../../../services/transactionService";

import {
  useCashBook,
} from "../../../hooks/useCashBook";

import {
  useCurrentMember,
} from "../../../hooks/useCurrentMember";

import {
  useMasterData,
} from "../../../hooks/useMasterData";

import type {
  Transaction,
} from "../../../types/transaction";

import {
  createCategory,
  createPaymentMode,
} from "../../../services/masterDataService";

type Props = {
  open: boolean;

  type:
  | "cash-in"
  | "cash-out";

  transaction:
  | Transaction
  | null;

  onClose: () => void;

  onTransactionSaved:
  () => Promise<void>;
};

function TransactionDrawer({
  open,
  type,
  transaction,
  onClose,
  onTransactionSaved,
}: Props) {

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    transactionDate,
    setTransactionDate,
  ] = useState(
    getTodayDate()
  );

  const [
    categoryId,
    setCategoryId,
  ] = useState("");

  const [
    paymentModeId,
    setPaymentModeId,
  ] = useState("");

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedType,
    setSelectedType,
  ] = useState<
    "cash-in" | "cash-out"
  >(type);

  const {
    categoryOptions,
    paymentModeOptions,
    reloadMasterData,
  } = useMasterData(selectedType);

  const {
    selectedCashBook,
  } = useCashBook();

  

  const currentMember =
    useCurrentMember();

  /*
   * Populate drawer when editing.
   *
   * If there is no transaction,
   * the drawer is in CREATE mode.
   */
  useEffect(() => {

    if (!open) {
      return;
    }

    /*
     * CREATE MODE
     */
    if (!transaction) {
      setSelectedType(type);

      resetForm();

      return;
    }

    /*
     * EDIT MODE
     */
    setAmount(
      String(
        transaction.amount
      )
    );

    /*
     * Only the date is shown in
     * the date input.
     *
     * The original timestamp remains
     * untouched until the user saves.
     */
    setTransactionDate(
      transaction.transaction_at
        .split("T")[0]
    );

    setCategoryId(
      transaction.category_id
    );

    setPaymentModeId(
      transaction.payment_mode_id
    );

    setRemarks(
      transaction.notes ?? ""
    );

    setError("");

  }, [
    open,
    transaction,
  ]);

  /*
   * Reset form for a new transaction.
   */
  function resetForm() {

    setAmount("");

    setCategoryId("");

    setPaymentModeId("");

    setRemarks("");

    setTransactionDate(
      getTodayDate()
    );

    setError("");
  }

  /*
   * Combine the selected date
   * with the CURRENT local time.
   *
   * Example:
   *
   * Selected date:
   * 2026-08-10
   *
   * Current time:
   * 15:12:35
   *
   * Result:
   * 2026-08-10T15:12:35+05:30
   *
   * This prevents Supabase from storing
   * the transaction at midnight.
   */
  function getTransactionTimestamp(
    selectedDate: string
  ): string {

    const now =
      new Date();

    const hours =
      String(
        now.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, "0");

    const seconds =
      String(
        now.getSeconds()
      ).padStart(2, "0");

    const milliseconds =
      String(
        now.getMilliseconds()
      ).padStart(3, "0");

    /*
     * Browser timezone offset.
     *
     * For India this becomes:
     * +05:30
     */
    const timezoneOffset =
      -now.getTimezoneOffset();

    const offsetSign =
      timezoneOffset >= 0
        ? "+"
        : "-";

    const absoluteOffset =
      Math.abs(
        timezoneOffset
      );

    const offsetHours =
      String(
        Math.floor(
          absoluteOffset / 60
        )
      ).padStart(2, "0");

    const offsetMinutes =
      String(
        absoluteOffset % 60
      ).padStart(2, "0");

    return (
      `${selectedDate}` +
      `T${hours}:${minutes}:${seconds}` +
      `.${milliseconds}` +
      `${offsetSign}` +
      `${offsetHours}:${offsetMinutes}`
    );
  }

  /*
 * =========================================================
 * Create Category
 * =========================================================
 */

  async function handleCreateCategory(
    name: string
  ) {

    if (!selectedCashBook) {

      throw new Error(
        "Cash Book not selected."
      );

    }


    const entryType =
      selectedType === "cash-in"
        ? "cash_in"
        : "cash_out";


    const created =
      await createCategory(
        selectedCashBook.id,
        name,
        entryType
      );


    /*
     * Refresh dropdown options.
     */

    await reloadMasterData();


    return {
      value: created.id,
      label: created.name,
    };

  }


  /*
   * =========================================================
   * Create Payment Mode
   * =========================================================
   */

  async function handleCreatePaymentMode(
    name: string
  ) {

    if (!selectedCashBook) {

      throw new Error(
        "Cash Book not selected."
      );

    }


    const created =
      await createPaymentMode(
        selectedCashBook.id,
        name
      );


    /*
     * Refresh dropdown options.
     */

    await reloadMasterData();


    return {
      value: created.id,
      label: created.name,
    };

  }

  async function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();

    setError("");

    /*
     * Validate amount
     */
    if (
      !amount ||
      Number(amount) <= 0
    ) {

      setError(
        "Please enter a valid amount."
      );

      return;
    }

    /*
     * Validate category
     */
    if (!categoryId) {

      setError(
        "Please select a category."
      );

      return;
    }

    /*
     * Validate payment mode
     */
    if (!paymentModeId) {

      setError(
        "Please select a payment mode."
      );

      return;
    }

    /*
     * Validate Cash Book
     */
    if (!selectedCashBook) {

      setError(
        "Cash Book not selected."
      );

      return;
    }

    /*
     * Validate current member
     */
    if (!currentMember) {

      setError(
        "Unable to identify member."
      );

      return;
    }

    try {

      setSaving(true);

      /*
       * ==================================================
       * EDIT MODE
       * ==================================================
       *
       * Existing transaction:
       * UPDATE the existing row.
       *
       * IMPORTANT:
       * We preserve the existing transaction time
       * when editing.
       *
       * Only the selected date is changed.
       */
      if (transaction) {

        const existingTime =
          transaction.transaction_at
            .split("T")[1]
            ?.split("+")[0]
            ?.split("Z")[0];

        const timePart =
          existingTime &&
            existingTime.length >= 8
            ? existingTime
            : getCurrentTime();

        const updatedTimestamp =
          `${transactionDate}T${timePart}`;

        await updateTransaction({

          transactionId:
            transaction.id,

          entryType:
            selectedType === "cash-in"
              ? "cash_in"
              : "cash_out",

          amount:
            Number(amount),

          transactionDate:
            updatedTimestamp,

          categoryId,

          paymentModeId,

          remarks,

        });

      }

      /*
       * ==================================================
       * CREATE MODE
       * ==================================================
       *
       * New transaction:
       * INSERT a new row.
       *
       * The selected date is combined
       * with the current time.
       */
      else {

        const transactionTimestamp =
          getTransactionTimestamp(
            transactionDate
          );

        await saveTransaction({

          groupId:
            selectedCashBook.id,

          memberId:
            currentMember.memberId,

          createdBy:
            currentMember.profileId,

          entryType:
            selectedType === "cash-in"
              ? "cash_in"
              : "cash_out",

          amount:
            Number(amount),

          transactionDate:
            transactionTimestamp,

          categoryId,

          paymentModeId,

          remarks,

        });

      }

      /*
       * Refresh transaction table
       * and financial summary.
       */
      await onTransactionSaved();

      /*
       * Reset form after success.
       */
      resetForm();

      /*
       * Close drawer.
       */
      onClose();

    }

    catch (error) {

      setError(

        error instanceof Error
          ? error.message
          : "Unable to save transaction."

      );

    }

    finally {

      setSaving(false);

    }

  }

  /*
   * Don't render anything when drawer
   * is closed.
   */
  if (!open) {
    return null;
  }

  return (

    <>

      <div
        className="drawer-overlay"
        onClick={
          saving
            ? undefined
            : onClose
        }
      />

      <aside
        className="transaction-drawer"
      >

        <div
          className="drawer-header"
        >

          <h2>

            {transaction

              ? "Edit Transaction"

              : selectedType === "cash-in"
                ? "Add Cash In Entry"
                : "Add Cash Out Entry"}

          </h2>

          <button
            type="button"
            className="drawer-close"
            onClick={
              onClose
            }
            disabled={
              saving
            }
          >

            ✕

          </button>

        </div>

        <TransactionForm

            type={selectedType}

          selectedType={
            selectedType
          }

          onTypeChange={
  (newType) => {

    setSelectedType(
      newType
    );

    /*
     * Clear category because
     * Cash In and Cash Out can
     * have different categories.
     */
    setCategoryId("");
    setPaymentModeId("");

    setError("");

  }
}

          amount={
            amount
          }

          transactionDate={
            transactionDate
          }

          categoryId={
            categoryId
          }

          paymentModeId={
            paymentModeId
          }

          remarks={
            remarks
          }

          error={
            error
          }

          saving={
            saving
          }

          categoryOptions={[

            {
              value: "",
              label:
                "Select Category",
            },

            ...categoryOptions,

          ]}

          paymentModeOptions={[

            {
              value: "",
              label:
                "Select Payment Mode",
            },

            ...paymentModeOptions,

          ]}

          onAmountChange={
            setAmount
          }

          onDateChange={
            setTransactionDate
          }

          onCategoryChange={
            setCategoryId
          }

          onPaymentModeChange={
            setPaymentModeId
          }

          onRemarksChange={
            setRemarks
          }

          onCancel={
            onClose
          }

          onSubmit={
            handleSubmit
          }

          onCreateCategory={
            handleCreateCategory
          }

          onCreatePaymentMode={
            handleCreatePaymentMode
          }

        />

      </aside>

    </>

  );
}

/*
 * Returns today's date in:
 *
 * YYYY-MM-DD
 *
 * using the user's local timezone.
 *
 * We do NOT use:
 * new Date().toISOString()
 *
 * because that is UTC and can shift
 * the date for users in India.
 */
function getTodayDate(): string {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return (
    `${year}-${month}-${day}`
  );
}

/*
 * Returns current local time:
 *
 * HH:mm:ss
 */
function getCurrentTime(): string {

  const now =
    new Date();

  const hours =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const seconds =
    String(
      now.getSeconds()
    ).padStart(2, "0");

  return (
    `${hours}:${minutes}:${seconds}`
  );
}

export default TransactionDrawer;