import { useEffect, useState } from "react";
import { loadMyCashBookGroups } from "../services/groupService";
import { useCashBook } from "./useCashBook";
import type { CashBookGroup } from "../types/cashBook";
import { useAuth } from "../contexts/AuthContext";

export function useCashBookGroups() {

    const { user } = useAuth();
    const {
        selectedCashBook,
        setSelectedCashBook,
    } = useCashBook();

    const [groups, setGroups] =
        useState<CashBookGroup[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function reloadGroups() {

        try {

            setLoading(true);

            setError(null);

            const loadedGroups =
                await loadMyCashBookGroups();

            // setGroups(loadedGroups);

            // if (loadedGroups.length === 0) {

            //     setSelectedCashBook(null);

            // } else {

            //     const selectedStillExists =
            //         selectedCashBook?.id &&
            //         loadedGroups.some(
            //             (group) =>
            //                 group.id === selectedCashBook.id
            //         );

            //     if (!selectedStillExists) {

            //         setSelectedCashBook(
            //             loadedGroups[0]
            //         );
            //     }
            //     else {

            //         const updatedSelectedCashBook =
            //             loadedGroups.find(
            //                 (group) =>
            //                     group.id === selectedCashBook?.id
            //             );

            //         if (updatedSelectedCashBook) {

            //             setSelectedCashBook(
            //                 updatedSelectedCashBook
            //             );

            //         }

            //     }
            setGroups(loadedGroups);

            if (loadedGroups.length === 0) {

                setSelectedCashBook(null);

            } else {

                const updatedSelectedCashBook =
                    selectedCashBook
                        ? loadedGroups.find(
                            (group) =>
                                group.id === selectedCashBook.id
                        )
                        : null;

                if (updatedSelectedCashBook) {

                    setSelectedCashBook(
                        updatedSelectedCashBook
                    );

                } else {

                    setSelectedCashBook(
                        loadedGroups[0]
                    );

                }

            }

        } catch (err) {

            console.error(err);

            setError(
                "Unable to load cash books."
            );

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        if (!user) {
            setGroups([]);
            return;
        }

        void reloadGroups();

    }, [user]);

    return {
        groups,
        loading,
        error,
        reloadGroups,
        selectedCashBook,
    };
}