import { supabase } from "../lib/supabase";

import type { CreateCashBookGroupInput } from "../types/cashBook";


export async function createCashBookGroup(
  input: CreateCashBookGroupInput
): Promise<string> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "create_cash_book_group",
    {
      p_name: input.name.trim(),
      p_description:
        input.description.trim() || null,
      p_currency_code:
        input.currencyCode,
      p_opening_balance:
        input.openingBalance,
      p_owner_name:
        input.ownerName.trim(),
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Cash book group was not created."
    );
  }

  return data;
}
