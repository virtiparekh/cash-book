import { supabase } from "../lib/supabase";
import type { MasterDataOption } from "../types/masterData";

export async function loadCategories(
  groupId: string
): Promise<MasterDataOption[]> {

  const { data, error } =
    await supabase
      .from("categories")
      .select("id,name")
      .eq("cash_book_group_id", groupId)
      .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function loadPaymentModes(
  groupId: string
): Promise<MasterDataOption[]> {

  const { data, error } =
    await supabase
      .from("payment_modes")
      .select("id,name")
      .eq("cash_book_group_id", groupId)
      .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}