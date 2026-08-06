/*  Why create this hook?

Later, if we add extra logic (for example, checking whether a cash book is selected, loading preferences, or handling permissions), we only need to update this hook. All components will continue to use:

const {
  selectedCashBook,
  setSelectedCashBook,
} = useCashBook();

without any changes.  */


import { useCashBookContext } from "../contexts/CashBookContext";

export function useCashBook() {
  return useCashBookContext();
}