export type Transaction = {

  id: string;

  transaction_at: string;

  amount: number;

  updated_at: string;

  balance_after: number;

  notes: string | null;

  entry_type:
    | "cash_in"
    | "cash_out";

  category_id: string;

  payment_mode_id: string;

  category_name: string;

  payment_mode_name: string;

  member_name: string;

  /*
   * Recurring transaction information.
   *
   * These are null for normal/manual transactions.
   */
  recurring_transaction_id: string | null;

  recurring_occurrence_date: string | null;
};