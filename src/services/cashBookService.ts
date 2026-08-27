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

/* =========================================================
   Duplicate Cash Book
========================================================= */

export async function duplicateCashBookGroup(
  sourceGroupId: string,
  newName: string,
  copyMembers: boolean,
  copyCategories: boolean,
  copyPaymentModes: boolean
): Promise<string> {

  const trimmedName = newName.trim();

  if (!trimmedName) {
    throw new Error(
      "Cash Book name cannot be empty."
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "duplicate_cash_book_group",
    {
      p_source_group_id: sourceGroupId,
      p_new_name: trimmedName,
      p_copy_members: copyMembers,
      p_copy_categories: copyCategories,
      p_copy_payment_modes: copyPaymentModes,
    }
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Cash Book could not be duplicated."
    );
  }

  return data;
}
