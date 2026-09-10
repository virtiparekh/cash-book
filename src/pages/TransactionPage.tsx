import {
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  useCashBook,
} from "../hooks/useCashBook";

import type { GroupMemberOption } from "../services/groupService";
import { getGroupMembers } from "../services/groupService";
import { useMasterData } from "../hooks/useMasterData";

import {
  useRecurringTransactions,
} from "../hooks/useRecurringTransactions";

import RecurringTransactionForm
  from "../components/recurring/RecurringTransactionForm";

import "./../styles/TransactionPage.css";
import { calculateNextOccurrence, formatDate, parseDate } from "../utils/recurringDateUtils";
import type { RecurringTransaction } from "../types/recurringTransaction";

type TransactionTab =
  | "transactions"
  | "recurring";

function getOrdinalSuffix(day: number): string {
  if (
    day % 100 >= 11 &&
    day % 100 <= 13
  ) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
function formatRecurringFrequency(
  frequencyType: string,
  frequencyInterval: number,
  daysOfWeek: number[] | null,
  dayOfMonth: number | null,
  monthOfYear: number | null
): string {
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (frequencyType === "daily") {
    return frequencyInterval === 1
      ? "Every day"
      : `Every ${frequencyInterval} days`;
  }

  if (frequencyType === "custom") {
    return frequencyInterval === 1
      ? "Every day"
      : `Every ${frequencyInterval} days`;
  }

  if (frequencyType === "weekly") {
    const selectedDays =
      (daysOfWeek ?? [])
        .filter(
          (day) =>
            Number.isInteger(day) &&
            day >= 0 &&
            day <= 6
        )
        .map(
          (day) => dayNames[day]
        );

    const daysText =
      selectedDays.length > 0
        ? selectedDays.join(", ")
        : "selected day";

    return frequencyInterval === 1
      ? `Every week on ${daysText}`
      : `Every ${frequencyInterval} weeks on ${daysText}`;
  }

  if (frequencyType === "monthly") {
    if (
      !dayOfMonth ||
      dayOfMonth < 1 ||
      dayOfMonth > 31
    ) {
      return frequencyInterval === 1
        ? "Every month"
        : `Every ${frequencyInterval} months`;
    }

    return frequencyInterval === 1
      ? `Every month on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`
      : `Every ${frequencyInterval} months on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;
  }

  if (frequencyType === "quarterly") {
    if (
      !dayOfMonth ||
      dayOfMonth < 1 ||
      dayOfMonth > 31
    ) {
      return frequencyInterval === 1
        ? "Every quarter"
        : `Every ${frequencyInterval} quarters`;
    }

    return frequencyInterval === 1
      ? `Every quarter on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`
      : `Every ${frequencyInterval} quarters on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;
  }

  if (frequencyType === "yearly") {
    if (
      !monthOfYear ||
      monthOfYear < 1 ||
      monthOfYear > 12 ||
      !dayOfMonth ||
      dayOfMonth < 1 ||
      dayOfMonth > 31
    ) {
      return frequencyInterval === 1
        ? "Every year"
        : `Every ${frequencyInterval} years`;
    }

    return frequencyInterval === 1
      ? `Every year on ${monthNames[monthOfYear - 1]} ${dayOfMonth}`
      : `Every ${frequencyInterval} years on ${monthNames[monthOfYear - 1]} ${dayOfMonth}`;
  }

  return frequencyType;
}
function TransactionsPage() {
  const { selectedCashBook } =
    useCashBook();

  const [activeTab, setActiveTab] =
    useState<TransactionTab>("recurring");

  const [
    showRecurringForm,
    setShowRecurringForm,
  ] = useState<boolean>(false);

  const {
    categoryOptions: cashInCategories,
    paymentModeOptions: cashInPaymentModes,
  } = useMasterData("cash-in");

  const {
    categoryOptions: cashOutCategories,
    paymentModeOptions: cashOutPaymentModes,
  } = useMasterData("cash-out");

  const {
    recurringTransactions,
    loading: recurringLoading,
    error: recurringError,
    reloadRecurringTransactions,
    toggleRecurringTransaction,
    skipNextOccurrence,
    undoSkipOccurrence,
    removeRecurringTransaction,
  } = useRecurringTransactions(
    selectedCashBook?.id
  );

  const [members, setMembers] = useState<GroupMemberOption[]>([]);

  const [recurringActionError, setRecurringActionError] =
    useState<string | null>(null);

  const [recurringTransactionToDelete, setRecurringTransactionToDelete] =
    useState<string | null>(null);

  const [recurringTransactionToEdit, setRecurringTransactionToEdit] =
    useState<RecurringTransaction | null>(null);


  const memberMap = useMemo(() => {
    return new Map(
      members.map((member) => [
        member.id,
        member.member_name,
      ])
    );
  }, [members]);

  const cashInCategoryMap = useMemo(() => {
    return new Map(
      cashInCategories.map((option) => [
        option.value,
        option.label,
      ])
    );
  }, [cashInCategories]);

  const cashOutCategoryMap = useMemo(() => {
    return new Map(
      cashOutCategories.map((option) => [
        option.value,
        option.label,
      ])
    );
  }, [cashOutCategories]);

  const cashInPaymentModeMap = useMemo(() => {
    return new Map(
      cashInPaymentModes.map((option) => [
        option.value,
        option.label,
      ])
    );
  }, [cashInPaymentModes]);

  const cashOutPaymentModeMap = useMemo(() => {
    return new Map(
      cashOutPaymentModes.map((option) => [
        option.value,
        option.label,
      ])
    );
  }, [cashOutPaymentModes]);
  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      if (!selectedCashBook?.id) {
        setMembers([]);
        return;
      }

      try {
        const data = await getGroupMembers(
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
          setMembers([]);
        }
      }
    };

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [selectedCashBook?.id]);

  // const getRecurringTransactionStatus = (
  //   recurringTransaction: RecurringTransaction
  // ): "active" | "paused" | "ended" => {
  //   if (
  //     recurringTransaction.end_date &&
  //     recurringTransaction.end_date < new Date().toISOString().slice(0, 10)
  //   ) {
  //     return "ended";
  //   }

  //   return recurringTransaction.is_active
  //     ? "active"
  //     : "paused";
  // };

  const formatRecurringDisplayDate = (
    dateString: string
): string => {
    const [year, month, day] =
        dateString.split("-").map(Number);

    const date = new Date(
        year,
        month - 1,
        day
    );

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};
  const getRecurringTransactionStatus = (
    recurringTransaction: RecurringTransaction
  ): "active" | "paused" | "ended" => {

    const today = new Date();

    const localToday =
      `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(
        today.getDate()
      ).padStart(2, "0")}`;

    if (
      recurringTransaction.end_date &&
      recurringTransaction.end_date < localToday
    ) {
      return "ended";
    }

    return recurringTransaction.is_active
      ? "active"
      : "paused";
  };
  return (
    <div className="transactions-page">

      <div className="transactions-page-header">
        <div>
          <h1>Transactions</h1>

          <p>
            Manage your transactions and recurring transactions.
          </p>
        </div>
      </div>

      {selectedCashBook && (
        <div className="transactions-current-cashbook">
          <span>Cash Book</span>

          <strong>
            {selectedCashBook.name}
          </strong>
        </div>
      )}

      <div className="transactions-tabs">

        {/* <button
          type="button"
          className={`transactions-tab ${activeTab === "transactions"
            ? "transactions-tab--active"
            : ""
            }`}
          onClick={() =>
            setActiveTab("transactions")
          }
        >
          All Transactions
        </button> */}

        <button
          type="button"
          className={`transactions-tab ${activeTab === "recurring"
            ? "transactions-tab--active"
            : ""
            }`}
          onClick={() =>
            setActiveTab("recurring")
          }
        >
          Recurring Transactions
        </button>

      </div>

      <div className="transactions-tab-content">

        {/* {activeTab === "transactions" && (
          <div className="transactions-placeholder">

            <h2>
              All Transactions
            </h2>

            <p>
              Transaction management will be available here.
            </p>

          </div>
        )} */}

        {activeTab === "recurring" && (
          <div className="recurring-transactions-placeholder">

            {!showRecurringForm && (
              <div className="recurring-transactions-header">

                <div>
                  <h2>
                    Recurring Transactions
                  </h2>

                  <p>
                    Manage transactions that repeat automatically.
                  </p>
                </div>

                <button
                  type="button"
                  className="recurring-add-button"
                  onClick={() => {
                    setRecurringTransactionToEdit(null);
                    setShowRecurringForm(true);
                  }}
                >
                  + Add Recurring Transaction
                </button>

              </div>
            )}

            {(showRecurringForm || recurringTransactionToEdit) && (
              <RecurringTransactionForm
                recurringTransaction={recurringTransactionToEdit}
                onCancel={() => {
                  setShowRecurringForm(false);
                  setRecurringTransactionToEdit(null);
                }}
                onSaved={() => {
                  void reloadRecurringTransactions();
                  setShowRecurringForm(false);
                  setRecurringTransactionToEdit(null);
                }}
              />
            )}

            {!showRecurringForm && !recurringTransactionToEdit &&
              !selectedCashBook && (
                <div className="recurring-transactions-empty">

                  <h3>
                    No Cash Book selected
                  </h3>

                  <p>
                    Please select a Cash Book to view recurring transactions.
                  </p>

                </div>
              )}

            {!showRecurringForm && !recurringTransactionToEdit &&
              selectedCashBook &&
              recurringLoading && (
                <div className="recurring-transactions-empty">

                  <p>
                    Loading recurring transactions...
                  </p>

                </div>
              )}

            {!showRecurringForm && !recurringTransactionToEdit &&
              selectedCashBook &&
              !recurringLoading &&
              recurringError && (
                <div className="recurring-transactions-empty">

                  <h3>
                    Unable to load recurring transactions
                  </h3>

                  <p>
                    {recurringError}
                  </p>

                </div>
              )}

            {!showRecurringForm && !recurringTransactionToEdit &&
              selectedCashBook &&
              !recurringLoading &&
              !recurringError &&
              recurringTransactions.length === 0 && (
                <div className="recurring-transactions-empty">

                  <h3>
                    No recurring transactions yet
                  </h3>

                  <p>
                    Create a recurring transaction to automatically
                    track regular income or expenses.
                  </p>

                </div>
              )}

            {!showRecurringForm && !recurringTransactionToEdit &&
              selectedCashBook &&
              !recurringLoading &&
              !recurringError &&
              recurringTransactions.length > 0 && (


                <div className="recurring-transactions-list">

                  {recurringTransactions.map((recurringTransaction) => {

                    const recurringStatus =
                      getRecurringTransactionStatus(
                        recurringTransaction
                      );

                    return (
                      <div
                        key={recurringTransaction.id}
                        className={`recurring-transaction-card ${recurringStatus === "paused"
                            ? "recurring-transaction-card--paused"
                            : recurringStatus === "ended"
                              ? "recurring-transaction-card--ended"
                              : ""
                          }`}
                      >

                        <div className="recurring-transaction-card-main">

                          <div className="recurring-transaction-card-top">

                            <div>
                              <span
                                className={`recurring-transaction-entry-type ${recurringTransaction.entry_type === "cash_in"
                                  ? "recurring-transaction-entry-type--cash-in"
                                  : "recurring-transaction-entry-type--cash-out"
                                  }`}
                              >
                                {recurringTransaction.entry_type === "cash_in"
                                  ? "Cash In"
                                  : "Cash Out"}
                              </span>

                              <h3>
                                {recurringTransaction.notes ||
                                  "Recurring Transaction"}
                              </h3>
                            </div>

                            <div
                              className={`recurring-transaction-amount ${recurringTransaction.entry_type === "cash_in"
                                ? "recurring-transaction-amount--cash-in"
                                : "recurring-transaction-amount--cash-out"
                                }`}
                            >
                              ₹
                              {recurringTransaction.amount.toLocaleString(
                                "en-IN"
                              )}
                            </div>

                          </div>

                          <div className="recurring-transaction-details">

                            <div className="recurring-transaction-detail">
                              <span className="recurring-transaction-detail-label">
                                Member
                              </span>

                              <span className="recurring-transaction-detail-value">
                                {memberMap.get(
                                  recurringTransaction.member_id
                                ) || "Unknown member"}
                              </span>
                            </div>

                            <div className="recurring-transaction-detail">
                              <span className="recurring-transaction-detail-label">
                                Category
                              </span>

                              <span className="recurring-transaction-detail-value">
                                {(recurringTransaction.entry_type === "cash_in"
                                  ? cashInCategoryMap
                                  : cashOutCategoryMap
                                ).get(
                                  recurringTransaction.category_id
                                ) || "Unknown category"}
                              </span>
                            </div>

                            <div className="recurring-transaction-detail">
                              <span className="recurring-transaction-detail-label">
                                Payment Mode
                              </span>

                              <span className="recurring-transaction-detail-value">
                                {(recurringTransaction.entry_type === "cash_in"
                                  ? cashInPaymentModeMap
                                  : cashOutPaymentModeMap
                                ).get(
                                  recurringTransaction.payment_mode_id
                                ) || "Unknown payment mode"}
                              </span>
                            </div>

                            <div className="recurring-transaction-detail">
                              <span className="recurring-transaction-detail-label">
                                Frequency
                              </span>

                              <span className="recurring-transaction-detail-value">
                                {formatRecurringFrequency(
                                  recurringTransaction.frequency_type,
                                  recurringTransaction.frequency_interval,
                                  recurringTransaction.days_of_week,
                                  recurringTransaction.day_of_month,
                                  recurringTransaction.month_of_year
                                )}
                              </span>
                            </div>

                            <div className="recurring-transaction-detail">
                              <span className="recurring-transaction-detail-label">
                                Next occurrence
                              </span>

                              <span className="recurring-transaction-detail-value">
                                {formatRecurringDisplayDate(
                                    recurringTransaction.next_due_date
                                )}
                              </span>
                            </div>

                            <div className="recurring-transaction-detail">
                              <span className="recurring-transaction-detail-label">
                                Ends
                              </span>

                              <span className="recurring-transaction-detail-value">
                                {recurringTransaction.end_date
                                  ? formatDate(
                                    parseDate(
                                      recurringTransaction.end_date
                                    )
                                  )
                                  : "Never"}
                              </span>
                            </div>

                            <div className="recurring-transaction-detail">
                              <span className="recurring-transaction-detail-label">
                                Status
                              </span>

                              <span
                                className={`recurring-transaction-status ${recurringStatus === "active"
                                  ? "recurring-transaction-status--active"
                                  : recurringStatus === "paused"
                                    ? "recurring-transaction-status--paused"
                                    : "recurring-transaction-status--ended"
                                  }`}
                              >
                                {recurringStatus === "active"
                                  ? "Active"
                                  : recurringStatus === "paused"
                                    ? "Paused"
                                    : "Ended"}
                              </span>
                            </div>

                          </div>

                          <div className="recurring-transaction-card-actions">

                            {recurringStatus === "ended" && (
                                <span className="recurring-transaction-ended-message">
                                    Recurrence ended
                                </span>
                            )}
                            <button
                              type="button"
                              className="recurring-transaction-action-button"
                              disabled={recurringStatus === "ended"}
                              onClick={() => {
                                if (recurringStatus === "ended") {
                                  return;
                                }
                                void toggleRecurringTransaction(
                                  recurringTransaction.id,
                                  !recurringTransaction.is_active
                                );
                              }}
                            >
                              {recurringTransaction.is_active
                                ? "Pause"
                                : "Resume"}
                            </button>

                            <button
                              type="button"
                              className="recurring-transaction-action-button"
                              disabled={
                                !recurringTransaction.is_active ||
                                recurringStatus === "ended"
                              }
                              onClick={() => {
                                if (
                                    recurringStatus === "ended" ||
                                    !recurringTransaction.is_active
                                ) {
                                    return;
                                }
                                setRecurringActionError(null);

                                const nextDate =
                                  calculateNextOccurrence(
                                    recurringTransaction.frequency_type,
                                    recurringTransaction.frequency_interval,
                                    recurringTransaction.next_due_date,
                                    recurringTransaction.days_of_week,
                                    recurringTransaction.day_of_month,
                                    recurringTransaction.month_of_year
                                  );

                                if (
                                  recurringTransaction.end_date &&
                                  nextDate >
                                  recurringTransaction.end_date
                                ) {
                                  setRecurringActionError(
                                    "The next occurrence falls after the recurring transaction's end date, so it cannot be skipped."
                                  );
                                  return;
                                }

                                void skipNextOccurrence(
                                  recurringTransaction.id,
                                  nextDate
                                );
                              }}
                            >
                              Skip Next
                            </button>

                            {recurringTransaction.previous_due_date && recurringStatus !== "ended" && (
                              <button
                                type="button"
                                className="recurring-transaction-action-button recurring-transaction-action-button--undo"
                                onClick={() => {
                                  void undoSkipOccurrence(
                                    recurringTransaction.id
                                  );
                                }}
                              >
                                Undo Skip
                              </button>
                            )}

                            <button
                              type="button"
                              className="recurring-transaction-action-button recurring-transaction-action-button--edit"
                              disabled={recurringStatus === "ended"}
                              onClick={() => {
                                setRecurringTransactionToEdit(
                                  recurringTransaction
                                );
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="recurring-transaction-action-button recurring-transaction-action-button--danger"
                              onClick={() => {
                                setRecurringTransactionToDelete(
                                  recurringTransaction.id
                                );
                              }}
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>


              )}

          </div>
        )}

        {recurringActionError && (
          <div className="recurring-error-overlay">
            <div className="recurring-error-modal">

              <div className="recurring-error-modal__icon">
                !
              </div>

              <h3>
                Cannot Skip Occurrence
              </h3>

              <p>
                {recurringActionError}
              </p>

              <button
                type="button"
                className="recurring-error-modal__close"
                onClick={() => {
                  setRecurringActionError(null);
                }}
              >
                Close
              </button>

            </div>
          </div>
        )}

        {recurringTransactionToDelete && (
          <div className="recurring-delete-overlay">
            <div className="recurring-delete-modal">
              <div className="recurring-delete-modal-header">
                <h3>Delete Recurring Transaction?</h3>
              </div>

              <div className="recurring-delete-modal-body">
                <p>
                  Are you sure you want to delete this recurring
                  transaction?
                </p>

                <p>
                  This will stop future automatic occurrences.
                  Existing transactions will not be deleted.
                </p>
              </div>

              <div className="recurring-delete-modal-actions">
                <button
                  type="button"
                  className="recurring-transaction-action-button"
                  onClick={() => {
                    setRecurringTransactionToDelete(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="recurring-transaction-action-button recurring-transaction-action-button--danger"
                  onClick={() => {
                    void removeRecurringTransaction(
                      recurringTransactionToDelete
                    ).then(() => {
                      setRecurringTransactionToDelete(null);
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default TransactionsPage;