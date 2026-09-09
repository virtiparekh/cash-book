import {
    useEffect,
    useState,
} from "react";

import {
    useCashBook,
} from "../../hooks/useCashBook";

import {
    useMasterData,
} from "../../hooks/useMasterData";

import {
    getGroupMembers,
} from "../../services/groupService";

import type { RecurringTransaction } from "../../types/recurringTransaction";
import { calculateFirstOccurrence } from "../../utils/recurringDateUtils";
import { createRecurringTransaction, updateRecurringTransaction, } from "../../services/recurringTransactionService";

type RecurringTransactionFormProps = {
    onCancel: () => void;
    onSaved: () => void;
    recurringTransaction?: RecurringTransaction | null;
};

type MemberOption = {
    id: string;
    member_name: string;
};

function RecurringTransactionForm({
    onCancel,
    onSaved,
    recurringTransaction,
}: RecurringTransactionFormProps) {

    const {
        selectedCashBook,
    } = useCashBook();


    const [entryType, setEntryType] = useState<"cash_in" | "cash_out">(
        recurringTransaction?.entry_type ?? "cash_out"
    );

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");


    /*
     * -------------------------------------------------
     * Master Data
     * -------------------------------------------------
     */

    const {
        categoryOptions,
        paymentModeOptions,
        loading: masterDataLoading,
    } = useMasterData(
        entryType === "cash_in"
            ? "cash-in"
            : "cash-out"
    );



    /*
     * -------------------------------------------------
     * Form State
     * -------------------------------------------------
     */

    const [
        amount,
        setAmount,
    ] = useState<string>("");


    const [
        memberId,
        setMemberId,
    ] = useState<string>("");


    const [
        categoryId,
        setCategoryId,
    ] = useState<string>("");


    const [
        paymentModeId,
        setPaymentModeId,
    ] = useState<string>("");


    const [
        notes,
        setNotes,
    ] = useState<string>("");


    const [
        frequencyType,
        setFrequencyType,
    ] = useState<
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
        | "custom"
    >("weekly");


    const [
        frequencyInterval,
        setFrequencyInterval,
    ] = useState<number>(1);


    const [
        daysOfWeek,
        setDaysOfWeek,
    ] = useState<number[]>([]);


    const [
        dayOfMonth,
        setDayOfMonth,
    ] = useState<string>("");


    const [
        monthOfYear,
        setMonthOfYear,
    ] = useState<string>("");


    const [
        startDate,
        setStartDate,
    ] = useState<string>("");


    const [
        endDate,
        setEndDate,
    ] = useState<string>("");


    const [
        neverEnds,
        setNeverEnds,
    ] = useState<boolean>(true);


    /*
     * -------------------------------------------------
     * Members
     * -------------------------------------------------
     */

    const [
        members,
        setMembers,
    ] = useState<MemberOption[]>([]);


    const [
        membersLoading,
        setMembersLoading,
    ] = useState<boolean>(false);


    const [
        membersError,
        setMembersError,
    ] = useState<string>("");


    const handleSave = async () => {
        setSaveError("");
        if(saving) {
            return;
        }

        if (!selectedCashBook?.id) {
            setSaveError("Please select a Cash Book.");
            return;
        }

        if (!memberId) {
            setSaveError("Please select a member.");
            return;
        }

        if (!categoryId) {
            setSaveError("Please select a category.");
            return;
        }

        if (!paymentModeId) {
            setSaveError("Please select a payment mode.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setSaveError("Please enter a valid amount.");
            return;
        }

        if (!startDate) {
            setSaveError("Please select a start date.");
            return;
        }

        if (
            frequencyType === "weekly" &&
            daysOfWeek.length === 0
        ) {
            setSaveError("Please select at least one weekday.");
            return;
        }

        if (
            ["monthly", "quarterly"].includes(frequencyType) &&
            !dayOfMonth
        ) {
            setSaveError("Please select a day of the month.");
            return;
        }

        if (
            frequencyType === "yearly" &&
            (!monthOfYear || !dayOfMonth)
        ) {
            setSaveError(
                "Please select both month and day for yearly recurrence."
            );
            return;
        }

        if (
            !neverEnds &&
            endDate &&
            endDate < startDate
        ) {
            setSaveError(
                "End date cannot be earlier than the start date."
            );
            return;
        }

        try {
            setSaving(true);

            const parsedDayOfMonth = dayOfMonth
                ? Number(dayOfMonth)
                : null;

            const parsedMonthOfYear = monthOfYear
                ? Number(monthOfYear)
                : null;

            const hasRecurrenceScheduleChanged = (): boolean => {
                if (!recurringTransaction) {
                    return true;
                }

                const oldDaysOfWeek =
                    recurringTransaction.days_of_week ?? [];

                const newDaysOfWeek =
                    frequencyType === "weekly"
                        ? daysOfWeek
                        : [];

                const daysChanged =
                    oldDaysOfWeek.length !== newDaysOfWeek.length ||
                    oldDaysOfWeek.some(
                        (day) => !newDaysOfWeek.includes(day)
                    );

                const oldDayOfMonth =
                    recurringTransaction.day_of_month;

                const newDayOfMonth =
                    ["monthly", "quarterly", "yearly"].includes(
                        frequencyType
                    )
                        ? parsedDayOfMonth
                        : null;

                const oldMonthOfYear =
                    recurringTransaction.month_of_year;

                const newMonthOfYear =
                    frequencyType === "yearly"
                        ? parsedMonthOfYear
                        : null;

                return (
                    recurringTransaction.frequency_type !== frequencyType ||
                    recurringTransaction.frequency_interval !==
                        frequencyInterval ||
                    daysChanged ||
                    oldDayOfMonth !== newDayOfMonth ||
                    oldMonthOfYear !== newMonthOfYear ||
                    recurringTransaction.start_date !== startDate
                );
            };

            const scheduleChanged =
                hasRecurrenceScheduleChanged();

            const nextDueDate =
                recurringTransaction && !scheduleChanged
                    ? recurringTransaction.next_due_date
                    : calculateFirstOccurrence(
                        frequencyType,
                        frequencyInterval,
                        startDate,
                        daysOfWeek,
                        parsedDayOfMonth,
                        parsedMonthOfYear
                    );

            if (
                !neverEnds &&
                endDate &&
                nextDueDate > endDate
            ) {
                setSaveError(
                    "The end date must be on or after the next scheduled occurrence."
                );
                return;
            }
            if (recurringTransaction) {
                await updateRecurringTransaction({
                    recurringTransactionId: recurringTransaction.id,
                    memberId: memberId,
                    entryType: entryType,
                    amount: Number(amount),
                    categoryId: categoryId,
                    paymentModeId: paymentModeId,
                    notes: notes.trim() || null,
                    frequencyType: frequencyType,
                    frequencyInterval: frequencyInterval,
                    daysOfWeek:
                        frequencyType === "weekly"
                            ? daysOfWeek
                            : null,
                    dayOfMonth:
                        ["monthly", "quarterly", "yearly"].includes(
                            frequencyType
                        )
                            ? parsedDayOfMonth
                            : null,
                    monthOfYear:
                        frequencyType === "yearly"
                            ? parsedMonthOfYear
                            : null,
                    startDate: startDate,
                    nextDueDate: nextDueDate,
                    endDate:
                        neverEnds || !endDate
                            ? null
                            : endDate,
                    isActive:recurringTransaction.is_active,
                    previousDueDate:scheduleChanged
                            ? null
                            : recurringTransaction.previous_due_date,
                });
            } else {
                await createRecurringTransaction({
                    groupId: selectedCashBook.id,
                    memberId: memberId,
                    createdBy: null,
                    entryType: entryType,
                    amount: Number(amount),
                    categoryId: categoryId,
                    paymentModeId: paymentModeId,
                    notes: notes.trim() || null,
                    frequencyType: frequencyType,
                    frequencyInterval: frequencyInterval,
                    daysOfWeek:
                        frequencyType === "weekly"
                            ? daysOfWeek
                            : null,
                    dayOfMonth:
                        ["monthly", "quarterly", "yearly"].includes(
                            frequencyType
                        )
                            ? parsedDayOfMonth
                            : null,
                    monthOfYear:
                        frequencyType === "yearly"
                            ? parsedMonthOfYear
                            : null,
                    startDate: startDate,
                    nextDueDate: nextDueDate,
                    endDate:
                        neverEnds || !endDate
                            ? null
                            : endDate,
                });
            }
            onSaved();
            onCancel();
        } catch (error) {
            console.error(
                "Unable to save recurring transaction.",
                error
            );

            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Unable to save recurring transaction."
            );
        } finally {
            setSaving(false);
        }
    };


    useEffect(() => {
        if (!recurringTransaction) {
            return;
        }

        setEntryType(recurringTransaction.entry_type);
        setAmount(String(recurringTransaction.amount));
        setMemberId(recurringTransaction.member_id);
        setCategoryId(recurringTransaction.category_id);
        setPaymentModeId(recurringTransaction.payment_mode_id);
        setNotes(recurringTransaction.notes ?? "");

        setFrequencyType(recurringTransaction.frequency_type);
        setFrequencyInterval(
            recurringTransaction.frequency_interval
        );

        setDaysOfWeek(
            recurringTransaction.days_of_week ?? []
        );

        setDayOfMonth(
            recurringTransaction.day_of_month
                ? String(recurringTransaction.day_of_month)
                : ""
        );

        setMonthOfYear(
            recurringTransaction.month_of_year
                ? String(recurringTransaction.month_of_year)
                : ""
        );

        setStartDate(recurringTransaction.start_date);

        setEndDate(
            recurringTransaction.end_date ?? ""
        );

        setNeverEnds(
            recurringTransaction.end_date === null
        );
    }, [recurringTransaction]);

    /*
     * -------------------------------------------------
     * Load Members
     * -------------------------------------------------
     */

    useEffect(() => {

        let cancelled = false;


        const loadMembers = async () => {

            if (!selectedCashBook?.id) {

                setMembers([]);

                setMembersLoading(false);

                return;

            }


            try {

                setMembersLoading(true);

                setMembersError("");


                const data =
                    await getGroupMembers(
                        selectedCashBook.id
                    );


                if (!cancelled) {

                    setMembers(data)

                }

            } catch (error) {

                console.error(
                    "Unable to load members.",
                    error
                );


                if (!cancelled) {

                    setMembersError(
                        error instanceof Error
                            ? error.message
                            : "Unable to load members."
                    );

                    setMembers([]);

                }

            } finally {

                if (!cancelled) {

                    setMembersLoading(false);

                }

            }

        };


        void loadMembers();


        return () => {

            cancelled = true;

        };

    }, [
        selectedCashBook?.id,
    ]);


    /*
     * -------------------------------------------------
     * Reset Category / Payment Mode when Entry Type
     * changes
     * -------------------------------------------------
     */

    // useEffect(() => {

    //     setCategoryId("");

    //     setPaymentModeId("");

    // }, [
    //     entryType,
    // ]);


    return (
        <div className="recurring-transaction-form">

            <div className="recurring-form-header">

                <div>

                    <h2>
                        {recurringTransaction
                            ? "Edit Recurring Transaction"
                            : "New Recurring Transaction"}
                    </h2>

                    <p>
                        Set up a transaction that repeats automatically.
                    </p>

                </div>


                <button
                    type="button"
                    className="recurring-form-close-button"
                    onClick={onCancel}
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <div className="recurring-form-body">

                {/* Entry Type */}

                <div className="recurring-form-field">

                    <label>
                        Entry Type
                    </label>


                    <div className="recurring-entry-type-options">

                        <button
                            type="button"
                            className={
                                entryType === "cash_out"
                                    ? "recurring-entry-type-button-cash-out recurring-entry-type-button-cash-out--active"
                                    : "recurring-entry-type-button-cash-out"
                            }
                            onClick={() => {
                                setEntryType("cash_out");
                                setCategoryId("");
                                setPaymentModeId("");
                            }}
                        >
                            Cash Out
                        </button>


                        <button
                            type="button"
                            className={
                                entryType === "cash_in"
                                    ? "recurring-entry-type-button-cash-in recurring-entry-type-button-cash-in--active"
                                    : "recurring-entry-type-button-cash-in"
                            }
                            onClick={() => {
                                setEntryType("cash_in")
                                setCategoryId("");
                                setPaymentModeId("");
                            }}
                        >
                            Cash In
                        </button>

                    </div>

                </div>


                {/* Amount */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-amount">
                        Amount
                    </label>


                    <input
                        id="recurring-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(event) =>
                            setAmount(
                                event.target.value
                            )
                        }
                        onWheel={(event) => {
                            event.currentTarget.blur();
                        }}
                        placeholder="Enter amount"
                    />

                </div>


                {/* Member */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-member">
                        Member
                    </label>


                    <select
                        id="recurring-member"
                        value={memberId}
                        onChange={(event) =>
                            setMemberId(
                                event.target.value
                            )
                        }
                        disabled={
                            membersLoading ||
                            !selectedCashBook
                        }
                    >

                        <option value="">
                            {membersLoading
                                ? "Loading members..."
                                : "Select member"}
                        </option>


                        {members.map(
                            (member) => (
                                <option
                                    key={member.id}
                                    value={member.id}
                                >
                                    {member.member_name}
                                </option>
                            )
                        )}

                    </select>


                    {membersError && (
                        <small>
                            {membersError}
                        </small>
                    )}

                </div>


                {/* Category */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-category">
                        Category
                    </label>


                    <select
                        id="recurring-category"
                        value={categoryId}
                        onChange={(event) =>
                            setCategoryId(
                                event.target.value
                            )
                        }
                        disabled={
                            masterDataLoading ||
                            !selectedCashBook
                        }
                    >

                        <option value="">
                            {masterDataLoading
                                ? "Loading categories..."
                                : "Select category"}
                        </option>


                        {categoryOptions.map(
                            (category) => (
                                <option
                                    key={category.value}
                                    value={category.value}
                                >
                                    {category.label}
                                </option>
                            )
                        )}

                    </select>

                </div>


                {/* Payment Mode */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-payment-mode">
                        Payment Mode
                    </label>


                    <select
                        id="recurring-payment-mode"
                        value={paymentModeId}
                        onChange={(event) =>
                            setPaymentModeId(
                                event.target.value
                            )
                        }
                        disabled={
                            masterDataLoading ||
                            !selectedCashBook
                        }
                    >

                        <option value="">
                            {masterDataLoading
                                ? "Loading payment modes..."
                                : "Select payment mode"}
                        </option>


                        {paymentModeOptions.map(
                            (paymentMode) => (
                                <option
                                    key={paymentMode.value}
                                    value={paymentMode.value}
                                >
                                    {paymentMode.label}
                                </option>
                            )
                        )}

                    </select>

                </div>


                {/* Notes */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-notes">
                        Notes
                    </label>


                    <textarea
                        id="recurring-notes"
                        value={notes}
                        onChange={(event) =>
                            setNotes(
                                event.target.value
                            )
                        }
                        placeholder="Optional notes"
                        rows={3}
                    />

                </div>


                {/* Frequency */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-frequency">
                        Frequency
                    </label>


                    <select
                        id="recurring-frequency"
                        value={frequencyType}
                        onChange={(event) =>
                            setFrequencyType(
                                event.target.value as
                                | "daily"
                                | "weekly"
                                | "monthly"
                                | "quarterly"
                                | "yearly"
                                | "custom"
                            )
                        }
                    >

                        <option value="daily">
                            Daily
                        </option>

                        <option value="weekly">
                            Weekly
                        </option>

                        <option value="monthly">
                            Monthly
                        </option>

                        <option value="quarterly">
                            Quarterly
                        </option>

                        <option value="yearly">
                            Yearly
                        </option>

                        <option value="custom">
                            Custom
                        </option>

                    </select>

                </div>


                {/* Frequency Interval */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-frequency-interval">
                        Every
                    </label>


                    <input
                        id="recurring-frequency-interval"
                        type="number"
                        min="1"
                        value={frequencyInterval}
                        onChange={(event) =>
                            setFrequencyInterval(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    />

                </div>


                {/* Weekly Days */}

                {frequencyType === "weekly" && (

                    <div className="recurring-form-field">

                        <label>
                            Days of Week
                        </label>


                        <div className="recurring-weekday-options">

                            {[
                                {
                                    value: 0,
                                    label: "Sun",
                                },
                                {
                                    value: 1,
                                    label: "Mon",
                                },
                                {
                                    value: 2,
                                    label: "Tue",
                                },
                                {
                                    value: 3,
                                    label: "Wed",
                                },
                                {
                                    value: 4,
                                    label: "Thu",
                                },
                                {
                                    value: 5,
                                    label: "Fri",
                                },
                                {
                                    value: 6,
                                    label: "Sat",
                                },
                            ].map((day) => (

                                <button
                                    key={day.value}
                                    type="button"
                                    className={
                                        daysOfWeek.includes(
                                            day.value
                                        )
                                            ? "recurring-weekday-button recurring-weekday-button--active"
                                            : "recurring-weekday-button"
                                    }
                                    onClick={() => {

                                        setDaysOfWeek(
                                            (currentDays) =>
                                                currentDays.includes(
                                                    day.value
                                                )
                                                    ? currentDays.filter(
                                                        (currentDay) =>
                                                            currentDay !==
                                                            day.value
                                                    )
                                                    : [
                                                        ...currentDays,
                                                        day.value,
                                                    ]
                                        );

                                    }}
                                >
                                    {day.label}
                                </button>

                            ))}

                        </div>

                    </div>

                )}


                {/* Monthly / Quarterly Day */}

                {(frequencyType === "monthly" ||
                    frequencyType === "quarterly") && (

                        <div className="recurring-form-field">

                            <label htmlFor="recurring-day-of-month">
                                Day of Month
                            </label>


                            <input
                                id="recurring-day-of-month"
                                type="number"
                                min="1"
                                max="31"
                                value={dayOfMonth}
                                onChange={(event) =>
                                    setDayOfMonth(
                                        event.target.value
                                    )
                                }
                                placeholder="1 - 31"
                            />

                        </div>

                    )}


                {/* Yearly Month */}

                {frequencyType === "yearly" && (
                    <>

                        <div className="recurring-form-field">

                            <label htmlFor="recurring-month-of-year">
                                Month
                            </label>


                            <select
                                id="recurring-month-of-year"
                                value={monthOfYear}
                                onChange={(event) =>
                                    setMonthOfYear(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="">
                                    Select month
                                </option>

                                <option value="1">
                                    January
                                </option>

                                <option value="2">
                                    February
                                </option>

                                <option value="3">
                                    March
                                </option>

                                <option value="4">
                                    April
                                </option>

                                <option value="5">
                                    May
                                </option>

                                <option value="6">
                                    June
                                </option>

                                <option value="7">
                                    July
                                </option>

                                <option value="8">
                                    August
                                </option>

                                <option value="9">
                                    September
                                </option>

                                <option value="10">
                                    October
                                </option>

                                <option value="11">
                                    November
                                </option>

                                <option value="12">
                                    December
                                </option>

                            </select>

                        </div>


                        <div className="recurring-form-field">

                            <label htmlFor="recurring-yearly-day">
                                Day of Month
                            </label>


                            <input
                                id="recurring-yearly-day"
                                type="number"
                                min="1"
                                max="31"
                                value={dayOfMonth}
                                onChange={(event) =>
                                    setDayOfMonth(
                                        event.target.value
                                    )
                                }
                                placeholder="1 - 31"
                            />

                        </div>

                    </>
                )}


                {/* Start Date */}

                <div className="recurring-form-field">

                    <label htmlFor="recurring-start-date">
                        Start Date
                    </label>


                    <input
                        id="recurring-start-date"
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(
                                event.target.value
                            )
                        }
                    />

                </div>


                {/* End Date */}

                <div className="recurring-form-field">

                    <label>
                        End Date
                    </label>


                    <label className="recurring-never-option">

                        <input
                            type="checkbox"
                            checked={neverEnds}
                            onChange={(event) =>
                                setNeverEnds(
                                    event.target.checked
                                )
                            }
                        />

                        Never

                    </label>


                    {!neverEnds && (

                        <input
                            type="date"
                            value={endDate}
                            onChange={(event) =>
                                setEndDate(
                                    event.target.value
                                )
                            }
                        />

                    )}

                </div>

            </div>

            {saveError && (
                <div className="recurring-form-error">
                    {saveError}
                </div>
            )}


            <div className="recurring-form-footer">

                <button
                    type="button"
                    className="recurring-form-cancel-button"
                    onClick={onCancel}
                >
                    Cancel
                </button>


                <button
                    type="button"
                    className="recurring-form-save-button"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : recurringTransaction
                            ? "Save Changes"
                            : "Save"}
                </button>

            </div>

        </div>
    );
}

export default RecurringTransactionForm;