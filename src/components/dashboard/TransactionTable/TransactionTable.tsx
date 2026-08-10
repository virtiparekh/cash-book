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

};


function TransactionTable({

  transactions,

  loading,

  onEdit,

  onDelete,

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


      <div
        className="transaction-toolbar"
      >

        <div>

          <h3>
            Transactions
          </h3>

          <p>
            Track every income and expense.
          </p>

        </div>

      </div>


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

                  <div
                    className="empty-state"
                  >

                    <div
                      className="empty-icon"
                    >
                      💰
                    </div>

                    <h4>
                      No Transactions Yet
                    </h4>

                    <p>
                      Your first Cash In or
                      Cash Out entry will
                      appear here.
                    </p>

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


                    <td>

                      {formatDate(
                        transaction.transaction_at
                      )}

                    </td>


                    <td>

                      {
                        transaction.member_name
                      }

                    </td>


                    <td>

                      {
                        transaction.category_name
                      }

                    </td>


                    <td>

                      {
                        transaction.payment_mode_name
                      }

                    </td>


                    <td>

                      {
                        transaction.notes &&
                        transaction.notes
                          .trim()
                          .length > 0
                          ? transaction.notes
                          : "-"
                      }

                    </td>


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


                    <td
                      className="amount-column"
                    >

                      {
                        formatCurrency(
                          transaction.balance_after
                        )
                      }

                    </td>


                    <td>

                      <div className="transaction-actions">

  <button
    type="button"
    className="transaction-icon-button transaction-icon-button--edit"
    onClick={() => onEdit(transaction)}
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

  <button
    type="button"
    className="transaction-icon-button transaction-icon-button--delete"
    onClick={() => onDelete(transaction)}
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


function formatDate(
  date: string
) {

  return new Date(date)
    .toLocaleDateString(
      "en-IN"
    );

}


export default TransactionTable;