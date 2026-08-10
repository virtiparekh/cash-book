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

import TransactionDetailsDrawer
from "../components/dashboard/TransactionDetailsDrawer/TransactionDetailsDrawer";

import SearchBar
from "../components/dashboard/SearchBar/SearchBar";

import { useFinancialSummary }
from "../hooks/useFinancialSummary";

import TransactionTable
from "../components/dashboard/TransactionTable/TransactionTable";

import type {
  Transaction,
} from "../types/transaction";

import {
  deleteTransaction,
} from "../services/transactionService";


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


  const [
    detailsTransaction,
    setDetailsTransaction,
  ] = useState<
    Transaction | null
  >(null);


  const [
    deletingTransactionId,
    setDeletingTransactionId,
  ] = useState<
    string | null
  >(null);


  /* -----------------------------------------------
     Cash In
  ------------------------------------------------ */

  const handleCashIn = () => {

    setEditingTransaction(
      null
    );

    setTransactionType(
      "cash-in"
    );

    setDrawerOpen(
      true
    );

  };


  /* -----------------------------------------------
     Cash Out
  ------------------------------------------------ */

  const handleCashOut = () => {

    setEditingTransaction(
      null
    );

    setTransactionType(
      "cash-out"
    );

    setDrawerOpen(
      true
    );

  };


  /* -----------------------------------------------
     Edit
  ------------------------------------------------ */

  const handleEditTransaction = (
    transaction: Transaction
  ) => {

    setDetailsTransaction(
      null
    );

    setEditingTransaction(
      transaction
    );

    setTransactionType(

      transaction.entry_type ===
      "cash_in"

        ? "cash-in"

        : "cash-out"

    );

    setDrawerOpen(
      true
    );

  };


  /* -----------------------------------------------
     View Details
  ------------------------------------------------ */

  const handleViewTransactionDetails = (
    transaction: Transaction
  ) => {

    setDetailsTransaction(
      transaction
    );

  };


  /* -----------------------------------------------
     Delete
  ------------------------------------------------ */

  const handleDeleteTransaction = async (
    transaction: Transaction
  ) => {

    if (!selectedCashBook) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete this transaction?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingTransactionId(
        transaction.id
      );


      await deleteTransaction(

        transaction.id,

      );


      await reloadTransactions();


      await refreshSummary();


    }

    catch (error) {

      console.error(
        "Unable to delete transaction.",
        error
      );


      window.alert(

        error instanceof Error

          ? error.message

          : "Unable to delete transaction."

      );

    }

    finally {

      setDeletingTransactionId(
        null
      );

    }

  };


  /* -----------------------------------------------
     Close Edit Drawer
  ------------------------------------------------ */

  const handleDrawerClose = () => {

    setDrawerOpen(
      false
    );

    setEditingTransaction(
      null
    );

  };


  /* -----------------------------------------------
     Close Details Drawer
  ------------------------------------------------ */

  const handleDetailsClose = () => {

    setDetailsTransaction(
      null
    );

  };


  return (

    <AppLayout

      userName={
        userEmail
      }

      cashBookName={
        selectedCashBook?.name ?? ""
      }

      onLogout={
        onLogout
      }

    >

      <div
        className="dashboard-container"
      >


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

          deletingTransactionId={
            deletingTransactionId
          }

          onViewDetails={
            handleViewTransactionDetails
          }

        />

      </div>


      {/* -----------------------------------------
          Create / Edit Drawer
      ------------------------------------------ */}

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

        onClose={
          handleDrawerClose
        }

        onTransactionSaved={
          async () => {

            await reloadTransactions();

            await refreshSummary();

          }
        }

      />


      {/* -----------------------------------------
          Read-only Transaction Details Drawer
      ------------------------------------------ */}

      <TransactionDetailsDrawer

        transaction={
          detailsTransaction
        }

        onClose={
          handleDetailsClose
        }

        onEdit={
          handleEditTransaction
        }

        onDelete={
          handleDeleteTransaction
        }

      />

    </AppLayout>

  );

}


export default DashboardPage;