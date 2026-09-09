import type { RecurringFrequencyType } from "../types/recurringTransaction";


/* =====================================================
   DATE HELPERS
===================================================== */

export function parseDate(dateString: string): Date {
    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


export function formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function daysInMonth(
    year: number,
    month: number
): number {
    return new Date(
        year,
        month,
        0
    ).getDate();
}


function clampDayOfMonth(
    year: number,
    month: number,
    day: number
): number {
    return Math.min(
        day,
        daysInMonth(year, month)
    );
}


/* =====================================================
   FIRST OCCURRENCE
===================================================== */

/**
 * Finds the first valid occurrence on or after startDate.
 *
 * Example:
 * startDate = 2026-09-10
 * weekly + Sunday
 *
 * result = 2026-09-13
 */
export function calculateFirstOccurrence(
    frequencyType: RecurringFrequencyType,
    _frequencyInterval: number,
    startDate: string,
    daysOfWeek: number[] | null,
    dayOfMonth: number | null,
    monthOfYear: number | null
): string {

    const start = parseDate(startDate);

    switch (frequencyType) {

        case "daily":
        case "custom":
            return formatDate(start);


        case "weekly": {

            const selectedDays =
                daysOfWeek && daysOfWeek.length > 0
                    ? [...daysOfWeek].sort(
                        (a, b) => a - b
                    )
                    : [start.getDay()];

            for (
                let offset = 0;
                offset < 7;
                offset++
            ) {

                const candidate = new Date(start);

                candidate.setDate(
                    start.getDate() + offset
                );

                if (
                    selectedDays.includes(
                        candidate.getDay()
                    )
                ) {
                    return formatDate(candidate);
                }
            }

            return formatDate(start);
        }


        case "monthly": {

            const requestedDay =
                dayOfMonth ?? start.getDate();

            const day = clampDayOfMonth(
                start.getFullYear(),
                start.getMonth() + 1,
                requestedDay
            );

            const candidate = new Date(
                start.getFullYear(),
                start.getMonth(),
                day
            );

            if (candidate < start) {

                candidate.setMonth(
                    candidate.getMonth() + 1
                );

                const correctedDay =
                    clampDayOfMonth(
                        candidate.getFullYear(),
                        candidate.getMonth() + 1,
                        requestedDay
                    );

                candidate.setDate(correctedDay);
            }

            return formatDate(candidate);
        }


        case "quarterly": {

            const requestedDay =
                dayOfMonth ?? 1;

            const startMonth =
                start.getMonth();

            const quarterStartMonth =
                Math.floor(startMonth / 3) * 3;

            let candidate = new Date(
                start.getFullYear(),
                quarterStartMonth,
                clampDayOfMonth(
                    start.getFullYear(),
                    quarterStartMonth + 1,
                    requestedDay
                )
            );

            if (candidate < start) {

                candidate = new Date(
                    start.getFullYear(),
                    quarterStartMonth + 3,
                    1
                );

                candidate.setDate(
                    clampDayOfMonth(
                        candidate.getFullYear(),
                        candidate.getMonth() + 1,
                        requestedDay
                    )
                );
            }

            return formatDate(candidate);
        }


        case "yearly": {

            const requestedMonth =
                monthOfYear ?? (
                    start.getMonth() + 1
                );

            const requestedDay =
                dayOfMonth ?? start.getDate();

            let candidate = new Date(
                start.getFullYear(),
                requestedMonth - 1,
                clampDayOfMonth(
                    start.getFullYear(),
                    requestedMonth,
                    requestedDay
                )
            );

            if (candidate < start) {

                candidate = new Date(
                    start.getFullYear() + 1,
                    requestedMonth - 1,
                    clampDayOfMonth(
                        start.getFullYear() + 1,
                        requestedMonth,
                        requestedDay
                    )
                );
            }

            return formatDate(candidate);
        }


        default:
            return formatDate(start);
    }
}


/* =====================================================
   NEXT OCCURRENCE
===================================================== */

/**
 * Calculates the occurrence after the supplied date.
 */
export function calculateNextOccurrence(
    frequencyType: RecurringFrequencyType,
    frequencyInterval: number,
    currentDate: string,
    daysOfWeek: number[] | null,
    dayOfMonth: number | null,
    monthOfYear: number | null
): string {

    const current = parseDate(currentDate);

    const interval =
        Math.max(1, frequencyInterval);


    /* -------------------------------------------------
       DAILY / CUSTOM
    ------------------------------------------------- */

    if (
        frequencyType === "daily" ||
        frequencyType === "custom"
    ) {

        const next = new Date(current);

        next.setDate(
            next.getDate() + interval
        );

        return formatDate(next);
    }


    /* -------------------------------------------------
       WEEKLY
    ------------------------------------------------- */

    if (frequencyType === "weekly") {

        const selectedDays =
            daysOfWeek && daysOfWeek.length > 0
                ? [...daysOfWeek].sort(
                    (a, b) => a - b
                )
                : [current.getDay()];

        const currentDay =
            current.getDay();


        // Look for another selected weekday
        // within the current week.

        for (
            const day of selectedDays
        ) {

            if (day > currentDay) {

                const next = new Date(current);

                next.setDate(
                    current.getDate()
                    + (day - currentDay)
                );

                return formatDate(next);
            }
        }


        // No selected weekday remains.
        // Move to the appropriate future week.

        const nextWeek =
            new Date(current);

        nextWeek.setDate(
            current.getDate()
            + (
                7 * interval
            )
        );

        const firstDay =
            selectedDays[0];

        const nextDay =
            nextWeek.getDay();

        nextWeek.setDate(
            nextWeek.getDate()
            + (
                firstDay - nextDay
            )
        );

        return formatDate(nextWeek);
    }


    /* -------------------------------------------------
       MONTHLY
    ------------------------------------------------- */

    if (frequencyType === "monthly") {

        const requestedDay =
            dayOfMonth ?? current.getDate();

        const target =
            new Date(current);

        target.setMonth(
            target.getMonth() + interval,
            1
        );

        target.setDate(
            clampDayOfMonth(
                target.getFullYear(),
                target.getMonth() + 1,
                requestedDay
            )
        );

        return formatDate(target);
    }


    /* -------------------------------------------------
       QUARTERLY
    ------------------------------------------------- */

    if (frequencyType === "quarterly") {

        const requestedDay =
            dayOfMonth ?? 1;

        const target =
            new Date(current);

        target.setMonth(
            target.getMonth()
            + (3 * interval),
            1
        );

        target.setDate(
            clampDayOfMonth(
                target.getFullYear(),
                target.getMonth() + 1,
                requestedDay
            )
        );

        return formatDate(target);
    }


    /* -------------------------------------------------
       YEARLY
    ------------------------------------------------- */

    if (frequencyType === "yearly") {

        const requestedMonth =
            monthOfYear
            ?? (current.getMonth() + 1);

        const requestedDay =
            dayOfMonth
            ?? current.getDate();

        const targetYear =
            current.getFullYear() + interval;

        const target =
            new Date(
                targetYear,
                requestedMonth - 1,
                1
            );

        target.setDate(
            clampDayOfMonth(
                targetYear,
                requestedMonth,
                requestedDay
            )
        );

        return formatDate(target);
    }


    return formatDate(current);
}