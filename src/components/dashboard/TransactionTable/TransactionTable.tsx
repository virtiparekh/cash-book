import "./TransactionTable.css";

import type { Transaction }
  from "../../../types/transaction";

import Loader
  from "../../common/Loader/Loader";

type TransactionTableProps = {

  transactions: Transaction[];

  loading: boolean;

};

function TransactionTable({

  transactions,

  loading,

}: TransactionTableProps) {

  if (loading) {

    return (

      <section className="transaction-section">

        <Loader text="Loading transactions..." />

      </section>

    );

  }

  return (

    <section className="transaction-section">

      <div className="transaction-toolbar">

        <div>

          <h3>
            Transactions
          </h3>

          <p>
            Track every income and expense.
          </p>

        </div>

      </div>

      <div className="transaction-table">

        <table>

          <thead>

            <tr>

              <th>Date</th>

              <th>Member</th>

              <th>Category</th>

              <th>Payment</th>

              <th className="amount-column">
                Amount
              </th>

              <th className="amount-column">
                Balance
              </th>

            </tr>

          </thead>

          <tbody>

            {transactions.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="empty-row"
                >

                  <div className="empty-state">

                    <div className="empty-icon">
                      💰
                    </div>

                    <h4>
                      No Transactions Yet
                    </h4>

                    <p>
                      Your first Cash In or Cash Out
                      entry will appear here.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              transactions.map(
                (transaction) => (

                  <tr
                    key={transaction.id}
                  >

                    <td>
                      {formatDate(
                        transaction.transaction_date
                      )}
                    </td>

                    <td>
                      {transaction.created_by_name}
                    </td>

                    <td>
                      {transaction.category_name}
                    </td>

                    <td>
                      {transaction.payment_mode_name}
                    </td>

                    <td
                      className={
                        transaction.entry_type === "cash_in"
                          ? "amount-positive"
                          : "amount-negative"
                      }
                    >
                      {transaction.entry_type === "cash_in"
                        ? "+"
                        : "-"}
                      {formatCurrency(
                        transaction.amount
                      )}
                    </td>

                    <td className="amount-column">

                      {formatCurrency(
                        transaction.balance_after
                      )}

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