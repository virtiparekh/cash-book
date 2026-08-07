import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCashBook } from "./useCashBook";

export type SelectOption = {
  value: string;
  label: string;
};

export function useMasterData(
  type: "cash-in" | "cash-out"
) {
  const { selectedCashBook } =
    useCashBook();

  const [categoryOptions,
    setCategoryOptions] =
    useState<SelectOption[]>([]);

  const [paymentModeOptions,
    setPaymentModeOptions] =
    useState<SelectOption[]>([]);

  useEffect(() => {

    const loadData = async () => {

      if (!selectedCashBook) {
        return;
      }

      const entryType =
        type === "cash-in"
          ? "cash_in"
          : "cash_out";

      //---------------- Categories ----------------

      const {
        data: categories,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select("id,name")
        .eq(
          "group_id",
          selectedCashBook.id
        )
        .eq(
          "entry_type",
          entryType
        )
        .eq(
          "is_active",
          true
        )
        .order("name");

      if (categoryError) {
        console.error(categoryError);
      }

      //---------------- Payment ----------------

      const {
        data: paymentModes,
        error: paymentError,
      } = await supabase
        .from("payment_modes")
        .select("id,name")
        .eq(
          "group_id",
          selectedCashBook.id
        )
        .eq(
          "applicable_entry_type",
          ["both"]
        )
        .eq(
          "is_active",
          true
        )
        .order("name");

      if (paymentError) {
        console.error(paymentError);
      }

      setCategoryOptions(
        (categories ?? []).map(
          (item) => ({
            value: item.id,
            label: item.name,
          })
        )
      );

      setPaymentModeOptions(
        (paymentModes ?? []).map(
          (item) => ({
            value: item.id,
            label: item.name,
          })
        )
      );

    };

    void loadData();

  }, [
    selectedCashBook,
    type,
  ]);

  return {
    categoryOptions,
    paymentModeOptions,
  };

}