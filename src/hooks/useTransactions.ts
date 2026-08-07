import {
    useCallback,
    useEffect,
    useState,
} from "react";

import type {
    Transaction,
} from "../types/transaction";

import {
    loadTransactions,
} from "../services/transactionService";

export function useTransactions(
    groupId?: string
) {

    const [
        transactions,
        setTransactions,
    ] = useState<Transaction[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] =
        useState<string | null>(null);

    const reloadTransactions =
        useCallback(async () => {

            if (!groupId) {

                setTransactions([]);

                return;

            }

            try {

                setLoading(true);

                setError(null);

                const result =
                    await loadTransactions(
                        groupId
                    );

                let runningBalance = 0;

                const transactionsWithBalance =
                    [...result]
                        .reverse()
                        .map((transaction) => {

                            if (
                                transaction.entry_type ===
                                "cash_in"
                            ) {

                                runningBalance +=
                                    transaction.amount;

                            } else {

                                runningBalance -=
                                    transaction.amount;

                            }

                            return {

                                ...transaction,

                                balance_after:
                                    runningBalance,

                            };

                        })
                        .reverse();

                setTransactions(
                    transactionsWithBalance
                );

            }

            catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load transactions.";

                setError(message);

            }

            finally {

                setLoading(false);

            }

        }, [groupId]);

    useEffect(() => {

        void reloadTransactions();

    }, [reloadTransactions]);

    return {

        transactions,

        loading,

        error,

        reloadTransactions,

    };

}