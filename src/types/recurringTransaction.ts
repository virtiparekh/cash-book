export type RecurringFrequencyType =
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "yearly"
    | "custom";

export type RecurringTransaction = {
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