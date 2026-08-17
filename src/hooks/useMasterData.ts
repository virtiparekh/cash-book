import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  loadCategories,
  loadPaymentModes,
} from "../services/masterDataService";

import {
  useCashBook,
} from "./useCashBook";


export type SelectOption = {
  value: string;
  label: string;
};


export function useMasterData(
  type: "cash-in" | "cash-out"
) {

  const {
    selectedCashBook,
  } = useCashBook();


  const [
    categoryOptions,
    setCategoryOptions,
  ] = useState<SelectOption[]>([]);


  const [
    paymentModeOptions,
    setPaymentModeOptions,
  ] = useState<SelectOption[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const reloadMasterData =
    useCallback(
      async () => {

        if (!selectedCashBook) {

          setCategoryOptions([]);
          setPaymentModeOptions([]);

          return;

        }


        try {

          setLoading(true);


          const entryType =
            type === "cash-in"
              ? "cash_in"
              : "cash_out";


          const [
            categories,
            paymentModes,
          ] = await Promise.all([

            loadCategories(
              selectedCashBook.id,
              entryType
            ),

            loadPaymentModes(
              selectedCashBook.id,
              entryType
            ),

          ]);


          setCategoryOptions(

            categories.map(
              (item) => ({
                value: item.id,
                label: item.name,
              })
            )

          );


          setPaymentModeOptions(

            paymentModes.map(
              (item) => ({
                value: item.id,
                label: item.name,
              })
            )

          );

        }

        catch (error) {

          console.error(
            "Unable to load master data.",
            error
          );

        }

        finally {

          setLoading(false);

        }

      },
      [
        selectedCashBook,
        type,
      ]
    );


  useEffect(() => {

    void reloadMasterData();

  }, [
    reloadMasterData,
  ]);


  return {

    categoryOptions,

    paymentModeOptions,

    loading,

    reloadMasterData,

  };

}