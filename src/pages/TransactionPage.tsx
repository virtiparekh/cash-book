import {
    useState,
} from "react";

import {
    useCashBook,
} from "../hooks/useCashBook";

import {
    useRecurringTransactions,
} from "../hooks/useRecurringTransactions";

import RecurringTransactionForm
    from "../components/recurring/RecurringTransactionForm";

import "./../styles/TransactionPage.css";

type TransactionTab =
    | "transactions"
    | "recurring";

function TransactionsPage() {
    const { selectedCashBook } =
        useCashBook();

    const [activeTab, setActiveTab] =
        useState<TransactionTab>("transactions");

    const [
        showRecurringForm,
        setShowRecurringForm,
    ] = useState<boolean>(false);

    const {
        recurringTransactions,
        loading: recurringLoading,
        error: recurringError,
        reloadRecurringTransactions,
    } = useRecurringTransactions(
        selectedCashBook?.id
    );

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

                <button
                    type="button"
                    className={`transactions-tab ${
                        activeTab === "transactions"
                            ? "transactions-tab--active"
                            : ""
                    }`}
                    onClick={() =>
                        setActiveTab("transactions")
                    }
                >
                    All Transactions
                </button>

                <button
                    type="button"
                    className={`transactions-tab ${
                        activeTab === "recurring"
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

                {activeTab === "transactions" && (
                    <div className="transactions-placeholder">

                        <h2>
                            All Transactions
                        </h2>

                        <p>
                            Transaction management will be available here.
                        </p>

                    </div>
                )}

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
                                    onClick={() =>
                                        setShowRecurringForm(true)
                                    }
                                >
                                    + Add Recurring Transaction
                                </button>

                            </div>
                        )}

                        {showRecurringForm && (
                            <RecurringTransactionForm
                                onCancel={() =>
                                    setShowRecurringForm(false)
                                }
                                onSaved={() => {
                                    void reloadRecurringTransactions();
                                }}
                            />
                        )}

                        {!showRecurringForm &&
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

                        {!showRecurringForm &&
                            selectedCashBook &&
                            recurringLoading && (
                                <div className="recurring-transactions-empty">

                                    <p>
                                        Loading recurring transactions...
                                    </p>

                                </div>
                            )}

                        {!showRecurringForm &&
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

                        {!showRecurringForm &&
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

                        {!showRecurringForm &&
                            selectedCashBook &&
                            !recurringLoading &&
                            !recurringError &&
                            recurringTransactions.length > 0 && (
                                <div className="recurring-transactions-list">

                                    {recurringTransactions.map(
                                        (recurringTransaction) => (
                                            <div
                                                key={
                                                    recurringTransaction.id
                                                }
                                                className="recurring-transaction-card"
                                            >

                                                <div>
                                                    <strong>
                                                        {
                                                            recurringTransaction.notes ||
                                                            "Recurring Transaction"
                                                        }
                                                    </strong>

                                                    <p>
                                                        ₹{" "}
                                                        {
                                                            recurringTransaction.amount
                                                        }
                                                    </p>
                                                </div>

                                                <div>
                                                    <p>
                                                        Next:{" "}
                                                        {
                                                            recurringTransaction.next_due_date
                                                        }
                                                    </p>
                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default TransactionsPage;