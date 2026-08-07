import { useState } from "react";

import "./TransactionDrawer.css";

import TransactionForm from "./TransactionForm";

import { useMasterData }
  from "../../../hooks/useMasterData";

type Props = {
  open: boolean;
  type: "cash-in" | "cash-out";
  onClose: () => void;
};

function TransactionDrawer({
  open,
  type,
  onClose,
}: Props) {

  const [amount, setAmount] =
    useState("");

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

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();

    setError("");

    console.log({
      amount,
      transactionDate,
      categoryId,
      paymentModeId,
      remarks,
      type,
    });

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