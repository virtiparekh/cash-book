import "./TransactionTable.css";

import type {
  Transaction,
} from "../../../types/transaction";

import Loader
  from "../../common/Loader/Loader";

type TransactionTableProps = {
  transactions: Transaction[];

  loading: boolean;

  onEdit: (
    transaction: Transaction
  ) => void;

  onDelete: (
    transaction: Transaction
  ) => void;

  deletingTransactionId?: string | null;

  onViewDetails: (
    transaction: Transaction
  ) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalTransactions: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

function TransactionTable({
  transactions,
  loading,
  onEdit,
  onDelete,
  deletingTransactionId,
  onViewDetails,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalTransactions,
  hasActiveFilters,
  onClearFilters
}: TransactionTableProps) {

  if (loading) {

    return (
      <section
        className="transaction-section"
      >
        <Loader
          text="Loading transactions..."
        />
      </section>
    );

  }

  return (

    <section
      className="transaction-section"
    >

      {/*<div
        className="transaction-toolbar">

         <div>
          <div className="transaction-title-row">

            <h3>
              Transactions
            </h3>

            {hasActiveFilters && (
              <span className="filtered-badge">
                Filtered
              </span>
            )}

          </div>

          <p>
            {hasActiveFilters
              ? `Showing ${transactions.length} of ${totalTransactions} transactions`
              : `Showing ${transactions.length} transactions`
            }
          </p>
        </div> 

      </div> */}

          {/* -----------------------------------------
          Pagination
      ------------------------------------------ */}

      {totalTransactions > 0 && (
        <div className="transaction-pagination">

          <div className="pagination-info">

            Showing{" "}

            {Math.min(
              (currentPage - 1) * pageSize + 1,
              totalTransactions
            )}

            {" - "}

            {Math.min(
              currentPage * pageSize,
              totalTransactions
            )}

            {" of "}

            {totalTransactions}

            {" transactions"}

            {hasActiveFilters && (
              <span className="filtered-badge">
                Filtered
              </span>
            )}

          </div>


          <div className="pagination-controls">

            {/* Previous */}

            <button
              type="button"
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() =>
                onPageChange(
                  currentPage - 1
                )
              }
              aria-label="Previous page"
            >
              ‹
            </button>


            {/* Page Numbers */}

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (

              <button
                key={page}
                type="button"
                className={
                  page === currentPage
                    ? "pagination-button pagination-button--active"
                    : "pagination-button"
                }
                onClick={() =>
                  onPageChange(page)
                }
              >
                {page}
              </button>

            ))}


            {/* Next */}

            <button
              type="button"
              className="pagination-button"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                onPageChange(
                  currentPage + 1
                )
              }
              aria-label="Next page"
            >
              ›
            </button>

          </div>


          {/* Page Size */}

          <div className="pagination-size">

            <label htmlFor="page-size">
              Rows per page
            </label>

            <select
              id="page-size"
              value={pageSize}
              onChange={(event) =>
                onPageSizeChange(
                  Number(
                    event.target.value
                  )
                )
              }
            >

              <option value={10}>
                10
              </option>

              <option value={25}>
                25
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>

            </select>

          </div>

        </div>
      )}
      <div
        className="transaction-table"
      >

        <table>

          <thead>

            <tr>

              <th>
                Date
              </th>

              <th>
                Member
              </th>

              <th>
                Category
              </th>

              <th>
                Payment
              </th>

              <th>
                Remarks
              </th>

              <th className="amount-column">
                Amount
              </th>

              <th className="amount-column">
                Current Balance
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {transactions.length === 0 ? (

              <tr>

                <td
                  colSpan={8}
                  className="empty-row"
                >

                  <div className="empty-state">

                    <div className="empty-icon">
                      🔍
                    </div>

                    {hasActiveFilters ? (
                      <>
                        <h4>
                          No Matching Transactions
                        </h4>

                        <p>
                          No transactions match your
                          current search or filters.
                        </p>

                        <button
                          type="button"
                          className="clear-results-button"
                          onClick={onClearFilters}
                        >
                          Clear Filters
                        </button>
                      </>
                    ) : (
                      <>
                        <h4>
                          No Transactions Yet
                        </h4>

                        <p>
                          Your first Cash In or Cash Out
                          entry will appear here.
                        </p>
                      </>
                    )}

                  </div>

                </td>

              </tr>

            ) : (

              transactions.map(
                (transaction) => (

                  <tr
                    key={
                      transaction.id
                    }
                  >

                    {/* DATE + TIME */}

                    <td>
                      <div className="transaction-date">
                        {formatDate(transaction.transaction_at)}
                      </div>

                      {/* <div className="transaction-time">
                        {formatTime(transaction.transaction_at)}
                      </div>

                      {isUpdated(transaction) && (
                        <div className="transaction-time">
                          Updated {formatTime(transaction.updated_at)}
                        </div>
                      )} */}

                      {isUpdated(transaction) ? (
                        <div className="transaction-time">
                          {formatTime(transaction.updated_at)}
                        </div>) : (

                        <div className="transaction-time">
                          {formatTime(transaction.transaction_at)}
                        </div>)
                      }
                    </td>

                    {/* MEMBER */}

                    <td>
                      {
                        transaction.member_name
                      }
                    </td>


                    {/* CATEGORY */}

                    <td>
                      {
                        transaction.category_name
                      }
                    </td>


                    {/* PAYMENT */}

                    <td>
                      {
                        transaction.payment_mode_name
                      }
                    </td>


                    {/* REMARKS */}

                    <td>

                      {transaction.notes &&
                        transaction.notes.trim().length > 0 ? (

                        <button
                          type="button"
                          className="transaction-remark-button"
                          onClick={() =>
                            onViewDetails(
                              transaction
                            )
                          }
                          title="View transaction details"
                        >
                          {
                            formatRemark(
                              transaction.notes
                            )
                          }
                        </button>

                      ) : (

                        <span className="remark-empty">
                          -
                        </span>

                      )}

                    </td>


                    {/* AMOUNT */}

                    <td
                      className={
                        transaction.entry_type ===
                          "cash_in"
                          ? "amount-positive"
                          : "amount-negative"
                      }
                    >

                      {
                        transaction.entry_type ===
                          "cash_in"
                          ? "+"
                          : "-"
                      }

                      {
                        formatCurrency(
                          transaction.amount
                        )
                      }

                    </td>


                    {/* BALANCE */}

                    <td
                      className="amount-column"
                    >

                      {
                        formatCurrency(
                          transaction.balance_after
                        )
                      }

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div
                        className="transaction-actions"
                      >

                        {/* EDIT */}

                        <button
                          type="button"
                          className="transaction-icon-button transaction-icon-button--edit"
                          onClick={() =>
                            onEdit(
                              transaction
                            )
                          }
                          disabled={
                            deletingTransactionId ===
                            transaction.id
                          }
                          title="Edit transaction"
                          aria-label="Edit transaction"
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


                        {/* DELETE */}

                        <button
                          type="button"
                          className="transaction-icon-button transaction-icon-button--delete"
                          onClick={() =>
                            onDelete(
                              transaction
                            )
                          }
                          disabled={
                            deletingTransactionId ===
                            transaction.id
                          }
                          title="Delete transaction"
                          aria-label="Delete transaction"
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

                            <path
                              d="M10 11v5M14 11v5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />

                          </svg>

                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </section>

  );
}


/* -------------------------------------------------
   Currency
------------------------------------------------- */

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


/* -------------------------------------------------
   Date
   Example:
   10 Oct, 2026
------------------------------------------------- */

function formatDate(
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


/* -------------------------------------------------
   Time
   Example:
   03:12 PM
------------------------------------------------- */

function formatTime(
  date: string
) {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  ).format(
    new Date(date)
  );

}


/* -------------------------------------------------
   Remark preview
------------------------------------------------- */

function formatRemark(
  remark: string
) {

  const cleanRemark =
    remark.trim();

  const maximumLength = 32;

  if (
    cleanRemark.length <=
    maximumLength
  ) {
    return cleanRemark;
  }

  return (
    cleanRemark.substring(
      0,
      maximumLength
    ).trimEnd() +
    "..."
  );

}

function isUpdated(
  transaction: Transaction
) {
  if (!transaction.updated_at) {
    return false;
  }

  const transactionTime =
    new Date(
      transaction.transaction_at
    ).getTime();

  const updatedTime =
    new Date(
      transaction.updated_at
    ).getTime();

  return (
    updatedTime >
    transactionTime + 1000
  );
}


export default TransactionTable;