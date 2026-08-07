import { supabase } from "../lib/supabase";

import type {
  Transaction,
} from "../types/transaction";

type TransactionRow = {
  id: string;
  transaction_at: string;
  amount: number;
  notes: string | null;
  entry_type: "cash_in" | "cash_out";
  categories:
  | {
    name: string;
  }
  | null;

  payment_modes:
  | {
    name: string;
  }
  | null;

  group_members:
  | {
    member_name: string;
  }
  | null;


};

export async function loadTransactions(
  groupId: string
): Promise<Transaction[]> {

  const {
    data,
    error,
  } = await supabase
    .from("transactions")
    .select(`
      id,
      transaction_at,
      amount,
      notes,
      entry_type,
      categories!transactions_category_id_fkey(name),
      payment_modes!transactions_payment_mode_id_fkey(name),
      group_members!transactions_member_id_fkey(member_name)
    `)
    .eq(
      "group_id",
      groupId
    )
    .is(
      "deleted_at",
      null
    )
    .order(
      "transaction_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
  }
  // console.log("Transactions from Supabase:", data);
  const rows: TransactionRow[] =
    Array.isArray(data)
      ? (data as unknown as TransactionRow[])
      : [];

  return rows.map<Transaction>((row) => {

    const category =
      row.categories;

    const paymentMode =
      row.payment_modes;

    const member =
      row.group_members;

    return {

      id: row.id,

      transaction_at: row.transaction_at,

      amount: row.amount,

      balance_after: 0,

      notes: row.notes,

      entry_type: row.entry_type,

      category_name:
        category?.name ?? "",

      payment_mode_name:
        paymentMode?.name ?? "",

      member_name:
        member?.member_name ?? "",

    };

  });
}

type SaveTransactionInput = {

  groupId: string;

  memberId: string;

  createdBy: string | null;

  entryType:
  | "cash_in"
  | "cash_out";

  amount: number;

  transactionDate: string;

  categoryId: string;

  paymentModeId: string;

  remarks: string;

};

export async function saveTransaction({

  groupId,

  memberId,

  createdBy,

  entryType,

  amount,

  transactionDate,

  categoryId,

  paymentModeId,

  remarks,

}: SaveTransactionInput): Promise<void> {

  const {
    error,
  } = await supabase
    .from("transactions")
    .insert({

      group_id:
        groupId,

      member_id:
        memberId,

      created_by:
        createdBy,

      entry_type:
        entryType,

      amount,

      transaction_at:
        transactionDate,

      category_id:
        categoryId,

      payment_mode_id:
        paymentModeId,

      notes:
        remarks,

    });

  if (error) {

    throw error;

  }

}