import {
    useEffect,
    useState,
} from "react";

import type {
    FinancialSummary,
} from "../types/summary";

import {
    loadFinancialSummary,
} from "../services/summaryService";

export function useFinancialSummary(
    groupId?: string
) {

    const [
        summary,
        setSummary,
    ] = useState<FinancialSummary>({
        totalCashIn: 0,
        totalCashOut: 0,
        netBalance: 0,
    });

    const [
        loading,
        setLoading,
    ] = useState(false);

    useEffect(() => {

        if (!groupId) {
            return;
        }

        const currentGroupId = groupId;

        async function fetchSummary() {

            setLoading(true);

            try {

                const result =
                    await loadFinancialSummary(
                        currentGroupId
                    );

                setSummary(result);

            } finally {

                setLoading(false);

            }

        }

        void fetchSummary();
    }, [groupId]);

    return {

        summary,

        loading,

        refreshSummary: async () => {

            if (!groupId) {
                return;
            }

            const currentGroupId = groupId;

            const result =
                await loadFinancialSummary(
                    currentGroupId
                );

            setSummary(result);

        },

    };

}