import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CashBookGroup } from "../types/cashBook";


type CashBookContextType = {
  selectedCashBook: CashBookGroup | null;
  setSelectedCashBook: (
    group: CashBookGroup | null
  ) => void;
};

const CashBookContext =
  createContext<CashBookContextType | undefined>(
    undefined
  );

type CashBookProviderProps = {
  children: ReactNode;
};

export function CashBookProvider({
  children,
}: CashBookProviderProps) {
  const [
    selectedCashBook,
    setSelectedCashBook,
  ] = useState<CashBookGroup | null>(
    null
  );

  //   Without useMemo, React recreates the context value on every render, causing unnecessary re-renders of all components using the context. Using useMemo makes the provider more efficient.
  const value = useMemo(
    () => ({
      selectedCashBook,
      setSelectedCashBook,
    }),
    [selectedCashBook]
  );

  return (
    <CashBookContext.Provider value={value}>
      {children}
    </CashBookContext.Provider>
  );
}

export function useCashBookContext() {
  const context =
    useContext(CashBookContext);

  if (!context) {
    throw new Error(
      "useCashBookContext must be used within CashBookProvider."
    );
  }

  return context;
}