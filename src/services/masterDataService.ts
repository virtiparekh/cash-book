import { supabase } from "../lib/supabase";

export type MasterDataOption = {
  id: string;
  name: string;
};


/*
 * =========================================================
 * Load Categories
 * =========================================================
 */

export async function loadCategories(
  groupId: string,
  entryType?: "cash_in" | "cash_out"
): Promise<MasterDataOption[]> {

  let query = supabase
    .from("categories")
    .select("id,name")
    .eq("group_id", groupId)
    .eq("is_active", true);

  if (entryType) {

    query = query.in(
      "entry_type",
      [
        entryType,
        "both",
      ]
    );

  }

  const {
    data,
    error,
  } = await query.order("name");


  if (error) {
    throw error;
  }


  return data ?? [];

}


/*
 * =========================================================
 * Load Payment Modes
 * =========================================================
 */

export async function loadPaymentModes(
  groupId: string,
  entryType?: "cash_in" | "cash_out"
): Promise<MasterDataOption[]> {

  let query = supabase
    .from("payment_modes")
    .select("id,name")
    .eq("group_id", groupId)
    .eq("is_active", true);


  if (entryType) {

    query = query.in(
      "applicable_entry_type",
      [
        entryType,
        "both",
      ]
    );

  }


  const {
    data,
    error,
  } = await query.order("name");


  if (error) {
    throw error;
  }


  return data ?? [];

}


/*
 * =========================================================
 * Create Category
 * =========================================================
 */

export async function createCategory(
  groupId: string,
  name: string,
  entryType: "cash_in" | "cash_out"
): Promise<MasterDataOption> {

  const trimmedName =
    name.trim();

  if (!trimmedName) {
    throw new Error(
      "Category name cannot be empty."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .insert({
      group_id: groupId,
      name: trimmedName,
      entry_type: entryType,
      is_active: true,
    })
    .select("id,name")
    .single();

  if (error) {

    if (error.code === "23505") {

      throw new Error(
        `Category "${trimmedName}" already exists.`
      );

    }

    throw error;
  }

  if (!data) {

    throw new Error(
      "Unable to create category."
    );

  }

  return data;
}


/*
 * =========================================================
 * Create Payment Mode
 * =========================================================
 */

export async function createPaymentMode(
  groupId: string,
  name: string
): Promise<MasterDataOption> {

  const trimmedName =
    name.trim();

  if (!trimmedName) {
    throw new Error(
      "Payment Mode name cannot be empty."
    );
  }

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in to create a payment mode."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("payment_modes")
    .insert({
      group_id: groupId,
      name: trimmedName,
      applicable_entry_type: "both",
      is_active: true,
      created_by: user.id,
    })
    .select("id,name")
    .single();

  if (error) {

    if (error.code === "23505") {

      throw new Error(
        `Payment Mode "${trimmedName}" already exists.`
      );

    }

    throw error;
  }

  if (!data) {

    throw new Error(
      "Unable to create payment mode."
    );

  }

  return data;
}

/*
 * =========================================================
 * Rename Category
 * =========================================================
 */

export async function renameCategory(
  categoryId: string,
  name: string
): Promise<MasterDataOption> {

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error(
      "Category name cannot be empty."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .update({
      name: trimmedName,
    })
    .eq("id", categoryId)
    .select("id,name")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Unable to rename category."
    );
  }

  return data;
}


/*
 * =========================================================
 * Delete Category
 *
 * Soft delete:
 * is_active = false
 * =========================================================
 */

export async function deleteCategory(
  categoryId: string
): Promise<void> {

  const {
    error,
  } = await supabase
    .from("categories")
    .update({
      is_active: false,
    })
    .eq("id", categoryId);

  if (error) {
    throw error;
  }
}


/*
 * =========================================================
 * Rename Payment Mode
 * =========================================================
 */

export async function renamePaymentMode(
  paymentModeId: string,
  name: string
): Promise<MasterDataOption> {

  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error(
      "Payment Mode name cannot be empty."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("payment_modes")
    .update({
      name: trimmedName,
    })
    .eq("id", paymentModeId)
    .select("id,name")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Unable to rename payment mode."
    );
  }

  return data;
}


/*
 * =========================================================
 * Delete Payment Mode
 *
 * Soft delete:
 * is_active = false
 * =========================================================
 */

export async function deletePaymentMode(
  paymentModeId: string
): Promise<void> {

  const {
    error,
  } = await supabase
    .from("payment_modes")
    .update({
      is_active: false,
    })
    .eq("id", paymentModeId);

  if (error) {
    throw error;
  }
}