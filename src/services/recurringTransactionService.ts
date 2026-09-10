import { supabase } from "../lib/supabase";

import type {
    RecurringTransaction,
    RecurringFrequencyType,
} from "../types/recurringTransaction";


type RecurringTransactionRow = {
    id: string;

    group_id: string;
    member_id: string;

    entry_type:
    | "cash_in"
    | "cash_out";

    amount: number;

    category_id: string;
    payment_mode_id: string;

    notes: string | null;

    created_by: string | null;

    frequency_type: RecurringFrequencyType;

    frequency_interval: number;

    days_of_week: number[] | null;

    day_of_month: number | null;

    month_of_year: number | null;

    start_date: string;

    next_due_date: string;

    end_date: string | null;

    is_active: boolean;

    last_generated_date: string | null;

    previous_due_date: string | null;

    created_at: string;

    updated_at: string;
};


/* =====================================================
   LOAD RECURRING TRANSACTIONS
===================================================== */

export async function loadRecurringTransactions(
    groupId: string
): Promise<RecurringTransaction[]> {

    /*
     * Keep ended recurring rules visible for 7 days
     * after their end date.
     *
     * Example:
     * End date = 2026-09-10
     * Visible through = 2026-09-17
     * Hidden from = 2026-09-18
     */
    const retentionDate = new Date();

    retentionDate.setDate(
        retentionDate.getDate() - 7
    );

    const retentionDateString =
        retentionDate.toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from("recurring_transactions")
        .select(`
            id,
            group_id,
            member_id,
            entry_type,
            amount,
            category_id,
            payment_mode_id,
            notes,
            created_by,
            frequency_type,
            frequency_interval,
            days_of_week,
            day_of_month,
            month_of_year,
            start_date,
            next_due_date,
            end_date,
            is_active,
            last_generated_date,
            previous_due_date,
            created_at,
            updated_at
        `)
        .eq("group_id", groupId)
        .or(
            `end_date.is.null,end_date.gte.${retentionDateString}`
        )
        .order("next_due_date", {
            ascending: true,
        });

    if (error) {
        throw error;
    }

    const rows: RecurringTransactionRow[] =
        Array.isArray(data)
            ? (data as unknown as RecurringTransactionRow[])
            : [];

    return rows;
}


/* =====================================================
   CREATE RECURRING TRANSACTION
===================================================== */

export type CreateRecurringTransactionInput = {

    groupId: string;

    memberId: string;

    createdBy: string | null;

    entryType:
    | "cash_in"
    | "cash_out";

    amount: number;

    categoryId: string;

    paymentModeId: string;

    notes: string | null;

    frequencyType: RecurringFrequencyType;

    frequencyInterval: number;

    daysOfWeek: number[] | null;

    dayOfMonth: number | null;

    monthOfYear: number | null;

    startDate: string;

    nextDueDate: string;

    endDate: string | null;
};


export async function createRecurringTransaction(
    input: CreateRecurringTransactionInput
): Promise<string> {

    const {
        groupId,
        memberId,
        createdBy,
        entryType,
        amount,
        categoryId,
        paymentModeId,
        notes,
        frequencyType,
        frequencyInterval,
        daysOfWeek,
        dayOfMonth,
        monthOfYear,
        startDate,
        nextDueDate,
        endDate,
    } = input;


    const { data, error } = await supabase
        .from("recurring_transactions")
        .insert({
            group_id: groupId,
            member_id: memberId,
            created_by: createdBy,

            entry_type: entryType,

            amount,

            category_id: categoryId,
            payment_mode_id: paymentModeId,

            notes: notes?.trim() || null,

            frequency_type: frequencyType,

            frequency_interval: frequencyInterval,

            days_of_week: daysOfWeek,

            day_of_month: dayOfMonth,

            month_of_year: monthOfYear,

            start_date: startDate,

            next_due_date: nextDueDate,

            end_date: endDate,

        })
        .select("id")
        .single();


    if (error) {
        throw error;
    }


    if (!data?.id) {
        throw new Error(
            "Recurring transaction could not be created."
        );
    }


    return data.id;
}


/* =====================================================
   UPDATE RECURRING TRANSACTION
===================================================== */

export type UpdateRecurringTransactionInput = {

    recurringTransactionId: string;

    memberId: string;

    entryType:
    | "cash_in"
    | "cash_out";

    amount: number;

    categoryId: string;

    paymentModeId: string;

    notes: string | null;

    frequencyType: RecurringFrequencyType;

    frequencyInterval: number;

    daysOfWeek: number[] | null;

    dayOfMonth: number | null;

    monthOfYear: number | null;

    startDate: string;

    nextDueDate: string;

    endDate: string | null;

    isActive: boolean;
    previousDueDate: string | null;
};


export async function updateRecurringTransaction(
    input: UpdateRecurringTransactionInput
): Promise<void> {

    const {
        recurringTransactionId,
        memberId,
        entryType,
        amount,
        categoryId,
        paymentModeId,
        notes,
        frequencyType,
        frequencyInterval,
        daysOfWeek,
        dayOfMonth,
        monthOfYear,
        startDate,
        nextDueDate,
        endDate,
        isActive,
        previousDueDate,
    } = input;


    const { error } = await supabase
        .from("recurring_transactions")
        .update({

            member_id: memberId,

            entry_type: entryType,

            amount,

            category_id: categoryId,

            payment_mode_id: paymentModeId,

            notes: notes?.trim() || null,

            frequency_type: frequencyType,

            frequency_interval: frequencyInterval,

            days_of_week: daysOfWeek,

            day_of_month: dayOfMonth,

            month_of_year: monthOfYear,

            start_date: startDate,

            next_due_date: nextDueDate,

            end_date: endDate,

            is_active: isActive,
            previous_due_date: previousDueDate,

            updated_at: new Date().toISOString(),

        })
        .eq("id", recurringTransactionId);


    if (error) {
        throw error;
    }
}


/* =====================================================
   DELETE RECURRING TRANSACTION
===================================================== */

export async function deleteRecurringTransaction(
    recurringTransactionId: string
): Promise<void> {

    const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", recurringTransactionId);


    if (error) {
        throw error;
    }
}


/* =====================================================
   PAUSE / RESUME RECURRING TRANSACTION
===================================================== */

export async function setRecurringTransactionActive(
    recurringTransactionId: string,
    isActive: boolean
): Promise<void> {

    const { error } = await supabase
        .from("recurring_transactions")
        .update({
            is_active: isActive,
            updated_at: new Date().toISOString(),
        })
        .eq("id", recurringTransactionId);


    if (error) {
        throw error;
    }
}


/* =====================================================
   SKIP NEXT OCCURRENCE
===================================================== */

export async function skipNextRecurringOccurrence(
    recurringTransactionId: string,
    nextDueDate: string
): Promise<void> {
    // First get the current next due date.
    const { data, error: fetchError } = await supabase
        .from("recurring_transactions")
        .select("next_due_date")
        .eq("id", recurringTransactionId)
        .single();

    if (fetchError) throw fetchError;

    if (!data?.next_due_date) {
        throw new Error(
            "The current next occurrence date could not be found."
        );
    }

    // Move the current date into previous_due_date
    // and set the newly calculated date as next_due_date.
    const { error: updateError } = await supabase
        .from("recurring_transactions")
        .update({
            previous_due_date: data.next_due_date,
            next_due_date: nextDueDate,
            updated_at: new Date().toISOString(),
        })
        .eq("id", recurringTransactionId);

    if (updateError) throw updateError;
}

/* =====================================================
   Undo SKIP NEXT OCCURRENCE
===================================================== */
export async function undoSkipRecurringOccurrence(
    recurringTransactionId: string
): Promise<void> {
    // Get the previously skipped occurrence date.
    const { data, error: fetchError } = await supabase
        .from("recurring_transactions")
        .select("previous_due_date")
        .eq("id", recurringTransactionId)
        .single();

    if (fetchError) throw fetchError;

    if (!data?.previous_due_date) {
        throw new Error(
            "There is no skipped occurrence available to undo."
        );
    }

    // Restore the previous occurrence date
    // and clear the stored previous date.
    const { error: updateError } = await supabase
        .from("recurring_transactions")
        .update({
            next_due_date: data.previous_due_date,
            previous_due_date: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", recurringTransactionId);

    if (updateError) throw updateError;
}

export async function generateDueRecurringTransactions(
    groupId: string
): Promise<number> {
    const { data, error } = await supabase.rpc(
        "generate_due_recurring_transactions",
        {
            p_group_id: groupId,
        }
    );

    if (error) {
        throw error;
    }

    return Number(data ?? 0);
}