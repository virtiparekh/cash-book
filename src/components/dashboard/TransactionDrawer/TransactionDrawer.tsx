import {
  useEffect,
  useState,
} from "react";

import "./TransactionDrawer.css";

import TransactionForm from "./TransactionForm";

import {
  saveTransaction,
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
    new Date()
      .toISOString()
      .split("T")[0]
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

  const {
    categoryOptions,
    paymentModeOptions,
  } = useMasterData(type);

  const {
    selectedCashBook,
  } = useCashBook();

  const currentMember =
    useCurrentMember();


  /*
   * Populate form when editing.
   *
   * When transaction is null,
   * the drawer is being used
   * for a new transaction.
   */
  useEffect(() => {

    if (!open) {
      return;
    }

    if (!transaction) {

      resetForm();

      return;
    }

    setAmount(
      String(transaction.amount)
    );

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


  function resetForm() {

    setAmount("");

    setCategoryId("");

    setPaymentModeId("");

    setRemarks("");

    setTransactionDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setError("");
  }


  async function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();

    setError("");


    if (
      !amount ||
      Number(amount) <= 0
    ) {

      setError(
        "Please enter a valid amount."
      );

      return;
    }


    if (!categoryId) {

      setError(
        "Please select a category."
      );

      return;
    }


    if (!paymentModeId) {

      setError(
        "Please select a payment mode."
      );

      return;
    }


    if (!selectedCashBook) {

      setError(
        "Cash Book not selected."
      );

      return;
    }


    if (!currentMember) {

      setError(
        "Unable to identify member."
      );

      return;
    }


    try {

      setSaving(true);


      /*
       * Current session:
       *
       * New transactions are saved
       * through INSERT.
       *
       * Edit UPDATE will be implemented
       * in the next step.
       */

      await saveTransaction({

        groupId:
          selectedCashBook.id,

        memberId:
          currentMember.memberId,

        createdBy:
          currentMember.profileId,

        entryType:
          type === "cash-in"
            ? "cash_in"
            : "cash_out",

        amount:
          Number(amount),

        transactionDate,

        categoryId,

        paymentModeId,

        remarks,

      });


      await onTransactionSaved();


      resetForm();

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
   * IMPORTANT:
   *
   * Do not render the drawer when
   * open === false.
   *
   * This fixes the drawer appearing
   * automatically after page refresh.
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-drawer-title"
      >


        <div
          className="drawer-header"
        >

          <h2
            id="transaction-drawer-title"
          >

            {transaction
              ? "Edit Transaction"
              : type === "cash-in"
                ? "Cash In"
                : "Cash Out"}

          </h2>


          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >

            ✕

          </button>

        </div>


        <TransactionForm

          type={type}

          amount={amount}

          transactionDate={
            transactionDate
          }

          categoryId={categoryId}

          paymentModeId={
            paymentModeId
          }

          remarks={remarks}

          error={error}

          saving={saving}


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

        />

      </aside>

    </>
  );
}

export default TransactionDrawer;