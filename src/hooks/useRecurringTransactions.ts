import {
    useCallback,
    useEffect,
    useState,
} from "react";

import type {
    RecurringTransaction,
} from "../types/recurringTransaction";

import {
    loadRecurringTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    setRecurringTransactionActive,
    skipNextRecurringOccurrence,
} from "../services/recurringTransactionService";

import type {
    CreateRecurringTransactionInput,
    UpdateRecurringTransactionInput,
} from "../services/recurringTransactionService";


export function useRecurringTransactions(
    groupId?: string
) {

    const [
        recurringTransactions,
        setRecurringTransactions,
    ] = useState<RecurringTransaction[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(null);


    /* =====================================================
       LOAD RECURRING TRANSACTIONS
    ===================================================== */

    const reloadRecurringTransactions =
        useCallback(async () => {

            if (!groupId) {
                setRecurringTransactions([]);
                return;
            }

            try {

                setLoading(true);
                setError(null);

                const result =
                    await loadRecurringTransactions(
                        groupId
                    );

                setRecurringTransactions(result);

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Unable to load recurring transactions.";

                setError(message);

            } finally {

                setLoading(false);
            }

        }, [groupId]);


    /* =====================================================
       INITIAL LOAD / GROUP CHANGE
    ===================================================== */

    useEffect(() => {

        void reloadRecurringTransactions();

    }, [reloadRecurringTransactions]);


    /* =====================================================
       CREATE
    ===================================================== */

    const addRecurringTransaction =
        useCallback(
            async (
                input: CreateRecurringTransactionInput
            ) => {

                setError(null);

                await createRecurringTransaction(
                    input
                );

                await reloadRecurringTransactions();

            },
            [reloadRecurringTransactions]
        );


    /* =====================================================
       UPDATE
    ===================================================== */

    const editRecurringTransaction =
        useCallback(
            async (
                input: UpdateRecurringTransactionInput
            ) => {

                setError(null);

                await updateRecurringTransaction(
                    input
                );

                await reloadRecurringTransactions();

            },
            [reloadRecurringTransactions]
        );


    /* =====================================================
       DELETE
    ===================================================== */

    const removeRecurringTransaction =
        useCallback(
            async (
                recurringTransactionId: string
            ) => {

                setError(null);

                await deleteRecurringTransaction(
                    recurringTransactionId
                );

                await reloadRecurringTransactions();

            },
            [reloadRecurringTransactions]
        );


    /* =====================================================
       PAUSE / RESUME
    ===================================================== */

    const toggleRecurringTransaction =
        useCallback(
            async (
                recurringTransactionId: string,
                isActive: boolean
            ) => {

                setError(null);

                await setRecurringTransactionActive(
                    recurringTransactionId,
                    isActive
                );

                await reloadRecurringTransactions();

            },
            [reloadRecurringTransactions]
        );


    /* =====================================================
       SKIP NEXT
    ===================================================== */

    const skipNextOccurrence =
        useCallback(
            async (
                recurringTransactionId: string,
                nextDueDate: string
            ) => {

                setError(null);

                await skipNextRecurringOccurrence(
                    recurringTransactionId,
                    nextDueDate
                );

                await reloadRecurringTransactions();

            },
            [reloadRecurringTransactions]
        );


    return {
        recurringTransactions,

        loading,

        error,

        reloadRecurringTransactions,

        addRecurringTransaction,

        editRecurringTransaction,

        removeRecurringTransaction,

        toggleRecurringTransaction,

        skipNextOccurrence,
    };
}