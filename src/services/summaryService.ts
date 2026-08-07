import { supabase } from "../lib/supabase";
import type { FinancialSummary } from "../types/summary";

export async function loadFinancialSummary(
  groupId: string
): Promise<FinancialSummary> {

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount,
      entry_type
    `)
    .eq("group_id", groupId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }

  let totalCashIn = 0;
  let totalCashOut = 0;

  for (const row of data ?? []) {

    if (row.entry_type === "cash_in") {

      totalCashIn += Number(row.amount);

    } else {

      totalCashOut += Number(row.amount);

    }

  }

  return {

    totalCashIn,

    totalCashOut,

    netBalance:
      totalCashIn - totalCashOut,

  };

}