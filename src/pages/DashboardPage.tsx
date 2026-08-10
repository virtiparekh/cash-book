import "./../styles/DashboardPage.css";

import FinancialSummary
  from "../components/dashboard/FinancialSummary/FinancialSummary";

import { useCashBook }
  from "../hooks/useCashBook";

import DashboardHeader
  from "../components/dashboard/DashboardHeader/DashboardHeader";

import AppLayout
  from "../components/layout/AppLayout/AppLayout";

import CashBookToolbar
  from "../components/dashboard/CashBookToolbar/CashBookToolbar";

import { useState } from "react";

import { useTransactions }
  from "../hooks/useTransactions";

import TransactionDrawer
  from "../components/dashboard/TransactionDrawer/TransactionDrawer";

import SearchBar
  from "../components/dashboard/SearchBar/SearchBar";

import { useFinancialSummary }
  from "../hooks/useFinancialSummary";

import TransactionTable
  from "../components/dashboard/TransactionTable/TransactionTable";

import type {
  Transaction,
} from "../types/transaction";


type DashboardPageProps = {

  userEmail: string;

  onLogout: () => void;

};


function DashboardPage({

  userEmail,

  onLogout,

}: DashboardPageProps) {


  const {
    selectedCashBook,
  } = useCashBook();


  const {

    transactions,

    loading:
      transactionsLoading,

    reloadTransactions,

  } = useTransactions(
    selectedCashBook?.id
  );


  const {

    summary,

    refreshSummary,

  } = useFinancialSummary(
    selectedCashBook?.id
  );


  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);


  const [
    transactionType,
    setTransactionType,
  ] = useState<
    "cash-in"
    | "cash-out"
  >("cash-in");


  const [
    editingTransaction,
    setEditingTransaction,
  ] = useState<
    Transaction | null
  >(null);


  const handleCashIn = () => {

    setEditingTransaction(null);

    setTransactionType(
      "cash-in"
    );

    setDrawerOpen(true);

  };


  const handleCashOut = () => {

    setEditingTransaction(null);

    setTransactionType(
      "cash-out"
    );

    setDrawerOpen(true);

  };


  const handleEditTransaction = (
    transaction: Transaction
  ) => {

    setEditingTransaction(
      transaction
    );

    setTransactionType(
      transaction.entry_type ===
        "cash_in"
        ? "cash-in"
        : "cash-out"
    );

    setDrawerOpen(true);

  };


  const handleDeleteTransaction = (
    transaction: Transaction
  ) => {

    console.log(
      "Delete transaction:",
      transaction
    );

  };


  const handleDrawerClose = () => {

    setDrawerOpen(false);

    setEditingTransaction(null);

  };


  return (

    <AppLayout

      userName={userEmail}

      cashBookName={
        selectedCashBook?.name ?? ""
      }

      onLogout={onLogout}
    >

      <div className="dashboard-container">


        <DashboardHeader

          title={
            selectedCashBook?.name ??
            "Cash Book"
          }

          subtitle={
            `Welcome ${userEmail}`
          }

        />


        <CashBookToolbar

          onCashIn={
            handleCashIn
          }

          onCashOut={
            handleCashOut
          }

        />


        <SearchBar />


        <FinancialSummary

          totalCashIn={
            summary.totalCashIn
          }

          totalCashOut={
            summary.totalCashOut
          }

          netBalance={
            summary.netBalance
          }

        />


        <TransactionTable

          transactions={
            transactions
          }

          loading={
            transactionsLoading
          }

          onEdit={
            handleEditTransaction
          }

          onDelete={
            handleDeleteTransaction
          }

        />


      </div>


      <TransactionDrawer

        open={
          drawerOpen
        }

        type={
          transactionType
        }

        transaction={
          editingTransaction
        }

        onClose={() => {
    setDrawerOpen(false);
    setEditingTransaction(null);
  }}

        onTransactionSaved={
          async () => {

            await reloadTransactions();

            await refreshSummary();

          }
        }

      />

    </AppLayout>

  );

}


export default DashboardPage;