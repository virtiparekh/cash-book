export type Transaction = {
  id: string;

  transaction_date: string;

  amount: number;

  balance_after: number;

  remarks: string | null;

  entry_type: "cash_in" | "cash_out";

  category_name: string;

  payment_mode_name: string;

  created_by_name: string;
};