import {
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

    useEffect(() => {

        if (!groupId) {
            return;
        }

        const currentGroupId = groupId;
        async function fetchData() {

            try {

                setLoading(true);

                const result =
                    await loadTransactions(
                        currentGroupId
                    );
                setTransactions(result);

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load transactions.";

                setError(message);

            } finally {

                setLoading(false);

            }

        }

        void fetchData();

    }, [groupId]);

    return {

        transactions,

        loading,

        error,

    };

}