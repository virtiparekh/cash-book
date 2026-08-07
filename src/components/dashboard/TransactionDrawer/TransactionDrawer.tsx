import { useState } from "react";

import "./TransactionDrawer.css";

import TransactionForm from "./TransactionForm";
import { saveTransaction }
  from "../../../services/transactionService";

import { useCashBook }
  from "../../../hooks/useCashBook";

import { useCurrentMember }
  from "../../../hooks/useCurrentMember";

import { useMasterData }
  from "../../../hooks/useMasterData";

type Props = {
  open: boolean;
  type: "cash-in" | "cash-out";
  onClose: () => void;
  onTransactionSaved: () => Promise<void>;
};

function TransactionDrawer({
  open,
  type,
  onClose,
  onTransactionSaved,
}: Props) {

  const [amount, setAmount] =
    useState("");
  const [saving, setSaving] =
    useState(false);

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

  const [remarks, setRemarks] =
    useState("");

  const [error, setError] =
    useState("");

  const {
    categoryOptions,
    paymentModeOptions,
  } = useMasterData(type);

  const {
    selectedCashBook,
  } = useCashBook();

  const currentMember =
    useCurrentMember();

  if (!open) {
    return null;
  }

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

  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    setError("");

    if (!amount || Number(amount) <= 0) {

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
    event.preventDefault();

    setError("");

    if (!amount || Number(amount) <= 0) {

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
      // console.log("Before");
      setSaving(true);
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
      // console.log("save")

      await onTransactionSaved();
      // console.log("reload")
      resetForm();

      onClose();

      // console.log("close")

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

  return (
    <>

      <div
        className="drawer-overlay"
        onClick={onClose}
      />

      <aside className="transaction-drawer">

        <div className="drawer-header">

          <h2>
            {type === "cash-in"
              ? "Cash In"
              : "Cash Out"}
          </h2>

          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <TransactionForm
          type={type}
          amount={amount}
          transactionDate={transactionDate}
          categoryId={categoryId}
          paymentModeId={paymentModeId}
          remarks={remarks}
          error={error}
          saving={saving}

          categoryOptions={[
            {
              value: "",
              label: "Select Category",
            },
            ...categoryOptions,
          ]}

          paymentModeOptions={[
            {
              value: "",
              label: "Select Payment Mode",
            },
            ...paymentModeOptions,
          ]}

          onAmountChange={setAmount}

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

          onCancel={onClose}

          onSubmit={handleSubmit}

        />

      </aside>

    </>
  );

}

export default TransactionDrawer;