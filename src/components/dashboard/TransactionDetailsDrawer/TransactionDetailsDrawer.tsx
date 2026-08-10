import "./TransactionDetailsDrawer.css";

import type {
  Transaction,
} from "../../../types/transaction";

type Props = {
  transaction:
    | Transaction
    | null;

  onClose: () => void;

  onEdit: (
    transaction: Transaction
  ) => void;

  onDelete: (
    transaction: Transaction
  ) => void;
};

function TransactionDetailsDrawer({
  transaction,
  onClose,
  onEdit,
  onDelete,
}: Props) {

  if (!transaction) {
    return null;
  }


  const isCashIn =
    transaction.entry_type ===
    "cash_in";


  const transactionDate =
    new Date(
      transaction.transaction_at
    );


  return (

    <>

      {/* Overlay */}

      <div
        className="transaction-details-overlay"
        onClick={onClose}
      />


      {/* Drawer */}

      <aside
        className="transaction-details-drawer"
      >

        {/* Header */}

        <div
          className="transaction-details-header"
        >

          <h2>
            Entry Details
          </h2>

          <button
            type="button"
            className="transaction-details-close"
            onClick={onClose}
            aria-label="Close details"
            title="Close"
          >

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >

              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

            </svg>

          </button>

        </div>


        {/* Content */}

        <div
          className="transaction-details-content"
        >

          {/* Main transaction card */}

          <section
            className="transaction-details-card"
          >

            <div
              className="transaction-details-top"
            >

              <div
                className={
                  isCashIn
                    ? "transaction-details-type transaction-details-type--cash-in"
                    : "transaction-details-type transaction-details-type--cash-out"
                }
              >

                <span
                  className="transaction-details-type-icon"
                >
                  {isCashIn ? "+" : "−"}
                </span>

                <span>
                  {isCashIn
                    ? "Cash In"
                    : "Cash Out"}
                </span>

              </div>


              <div
                className="transaction-details-date"
              >

                <span>
                  On{" "}
                  {formatDate(
                    transactionDate
                  )}
                </span>

                <span>
                  {formatTime(
                    transactionDate
                  )}
                </span>

              </div>

            </div>


            {/* Amount */}

            <div
              className={
                isCashIn
                  ? "transaction-details-amount transaction-details-amount--cash-in"
                  : "transaction-details-amount transaction-details-amount--cash-out"
              }
            >

              {isCashIn
                ? "+"
                : "-"}

              {formatCurrency(
                transaction.amount
              )}

            </div>


            <div
              className="transaction-details-divider"
            />


            {/* Remark */}

            <div
              className="transaction-details-field"
            >

              <span
                className="transaction-details-label"
              >
                Remark
              </span>

              <p
                className="transaction-details-remark"
              >
                {transaction.notes &&
                transaction.notes.trim()
                  .length > 0
                  ? transaction.notes
                  : "No remark added."}
              </p>

            </div>


            {/* Tags */}

            <div
              className="transaction-details-tags"
            >

              <span
                className="transaction-details-tag transaction-details-tag--category"
              >
                {transaction.category_name}
              </span>

              <span
                className="transaction-details-tag transaction-details-tag--payment"
              >
                {transaction.payment_mode_name}
              </span>

            </div>

          </section>


          {/* Activities */}

          <section
            className="transaction-details-activities"
          >

            <h3>
              Activities
            </h3>


            <div
              className="transaction-activity"
            >

              <div
                className="transaction-activity-icon"
              >
                +
              </div>


              <div
                className="transaction-activity-content"
              >

                <strong>
                  Created by{" "}
                  {transaction.member_name}
                </strong>

                <span>
                  On{" "}
                  {formatDate(
                    transactionDate
                  )}
                  ,{" "}
                  {formatTime(
                    transactionDate
                  )}
                </span>

              </div>

            </div>

          </section>

        </div>


        {/* Footer */}

        <div
          className="transaction-details-footer"
        >

          <button
            type="button"
            className="transaction-details-delete-button"
            onClick={() => {
              onDelete(
                transaction
              );
              onClose();
            }}
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
              />

              <path
                d="M19 6l-1 14H6L5 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />

            </svg>

            <span>
              Delete
            </span>

          </button>


          <button
            type="button"
            className="transaction-details-edit-button"
            onClick={() => {
              onEdit(
                transaction
              );
              onClose();
            }}
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

            <span>
              Edit
            </span>

          </button>

        </div>

      </aside>

    </>
  );
}


/* -----------------------------------------------
   Currency
------------------------------------------------ */

function formatCurrency(
  amount: number
) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(amount);

}


/* -----------------------------------------------
   Date
------------------------------------------------ */

function formatDate(
  date: Date
) {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(date)
    .replace(
      /(\d{2})\s([A-Za-z]{3})\s(\d{4})/,
      "$2 $1, $3"
    );

}


/* -----------------------------------------------
   Time
------------------------------------------------ */

function formatTime(
  date: Date
) {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);

}


export default TransactionDetailsDrawer;