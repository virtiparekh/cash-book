import { supabase } from "../lib/supabase";

import type {
  Transaction,
} from "../types/transaction";


type TransactionRow = {

  id: string;

  transaction_at: string;

  amount: number;

  notes: string | null;

  entry_type:
    | "cash_in"
    | "cash_out";

  category_id: string;

  payment_mode_id: string;

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
      category_id,
      payment_mode_id,
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


  const rows: TransactionRow[] =
    Array.isArray(data)
      ? (
          data as unknown as TransactionRow[]
        )
      : [];


  return rows.map(
    (row) => {

      const category =
        row.categories;

      const paymentMode =
        row.payment_modes;

      const member =
        row.group_members;


      return {

        id:
          row.id,

        transaction_at:
          row.transaction_at,

        amount:
          Number(row.amount),

        notes:
          row.notes,

        entry_type:
          row.entry_type,

        category_id:
          row.category_id,

        payment_mode_id:
          row.payment_mode_id,

        category_name:
          category?.name ?? "",

        payment_mode_name:
          paymentMode?.name ?? "",

        member_name:
          member?.member_name ?? "",

        /*
         * Your current transactions table
         * does not have a balance_after column.
         *
         * We will implement calculated balance
         * separately in a later session.
         */
        balance_after:
          0,

      };

    }
  );

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

type UpdateTransactionInput = {
  transactionId: string;
  entryType: "cash_in" | "cash_out";
  amount: number;
  transactionDate: string;
  categoryId: string;
  paymentModeId: string;
  remarks: string;
};

export async function updateTransaction({
  transactionId,
  entryType,
  amount,
  transactionDate,
  categoryId,
  paymentModeId,
  remarks,
}: UpdateTransactionInput): Promise<void> {
  const {
    error,
  } = await supabase
    .from("transactions")
    .update({
      entry_type: entryType,
      amount,
      transaction_at: transactionDate,
      category_id: categoryId,
      payment_mode_id: paymentModeId,
      notes: remarks,
    })
    .eq(
      "id",
      transactionId
    );

  if (error) {
    throw error;
  }
}

export async function deleteTransaction(
  transactionId: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("transactions")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq(
      "id",
      transactionId
    );

  if (error) {
    throw error;
  }
}