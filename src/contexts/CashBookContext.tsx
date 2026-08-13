import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  CashBookGroup,
} from "../types/cashBook";

import {
  loadCurrentMember,
} from "../services/memberService";

import type {
  GroupMember,
} from "../types/member";

import { useEffect } from "react";

type CashBookContextType = {

  selectedCashBook:
  CashBookGroup | null;

  setSelectedCashBook: (
    group: CashBookGroup | null
  ) => void;

  currentMember:
  GroupMember | null;

  setCurrentMember: (
    member: GroupMember | null
  ) => void;

};

const CashBookContext =
  createContext<
    CashBookContextType | undefined
  >(undefined);

type CashBookProviderProps = {
  children: ReactNode;
};

export function CashBookProvider({
  children,
}: CashBookProviderProps) {

  const [
    selectedCashBook,
    setSelectedCashBook,
  ] =
    useState<CashBookGroup | null>(
      null
    );

  const [
    currentMember,
    setCurrentMember,
  ] =
    useState<GroupMember | null>(
      null
    );

  const value = useMemo(
    () => ({
      selectedCashBook,
      setSelectedCashBook,
      currentMember,
      setCurrentMember,
    }),
    [
      selectedCashBook,
      currentMember,
    ]
  );

  useEffect(() => {

    let cancelled = false;

    const loadMember = async () => {

      if (!selectedCashBook?.id) {

        setCurrentMember(null);

        return;
      }

      try {

        const member =
          await loadCurrentMember(
            selectedCashBook.id
          );

        if (!cancelled) {

          setCurrentMember(
            member
          );

        }

      } catch (error) {

        console.error(
          "Unable to load current member.",
          error
        );

        if (!cancelled) {

          setCurrentMember(
            null
          );

        }

      }

    };

    void loadMember();

    return () => {

      cancelled = true;

    };

  }, [
    selectedCashBook?.id,
  ]);

  return (

    <CashBookContext.Provider
      value={value}
    >

      {children}

    </CashBookContext.Provider>

  );

}

export function useCashBookContext() {

  const context =
    useContext(
      CashBookContext
    );

  if (!context) {

    throw new Error(
      "useCashBookContext must be used within CashBookProvider."
    );

  }

  return context;

}