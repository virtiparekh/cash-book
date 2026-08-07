import { supabase } from "../lib/supabase";
import type { Transaction } from "../types/transaction";

export async function loadTransactions(
  groupId: string
): Promise<Transaction[]> {

  const { data, error } =
    await supabase
      .from("transactions")
      .select(`
        id,
        transaction_date,
        amount,
        balance_after,
        remarks,
        entry_type,
        categories(name),
        payment_modes(name),
        profiles(full_name)
      `)
      .eq("cash_book_group_id", groupId)
      .order(
        "transaction_date",
        { ascending: false }
      );

  if (error) {
    throw error;
  }

  return (data ?? []).map((item: any) => ({
    id: item.id,

    transaction_date:
      item.transaction_date,

    amount:
      item.amount,

    balance_after:
      item.balance_after,

    remarks:
      item.remarks,

    entry_type:
      item.entry_type,

    category_name:
      item.categories?.name ?? "",

    payment_mode_name:
      item.payment_modes?.name ?? "",

    created_by_name:
      item.profiles?.full_name ?? "",
  }));

}