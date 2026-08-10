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

import {
  useEffect
} from "react";


type DashboardPageProps = {

  userEmail: string;

  onLogout: () => void;

};


function DashboardPage({

  userEmail,

  onLogout,

}: DashboardPageProps) {

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);


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

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    filters,
    setFilters,
  ] = useState({
    duration: "All Time",
    member: "All Members",
    category: "All Categories",
    paymentMode: "All Modes",
    fromDate: "",
    toDate: "",
  });

  const members = Array.from(
    new Set(
      transactions
        .map(
          (transaction) =>
            transaction.member_name
        )
        .filter(Boolean)
    )
  );

  const categories = Array.from(
    new Set(
      transactions
        .map(
          (transaction) =>
            transaction.category_name
        )
        .filter(Boolean)
    )
  );

  const paymentModes = Array.from(
    new Set(
      transactions
        .map(
          (transaction) =>
            transaction.payment_mode_name
        )
        .filter(Boolean)
    )
  );

  const filteredTransactions =
    transactions.filter((transaction) => {

      /*
       * -----------------------------------------
       * SEARCH
       * -----------------------------------------
       */

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      const amount =
        String(transaction.amount);

      const remarks =
        transaction.notes
          ?.toLowerCase() ?? "";

      const matchesSearch =
        !search ||
        amount.includes(search) ||
        remarks.includes(search);


      /*
       * -----------------------------------------
       * MEMBER
       * -----------------------------------------
       */

      const matchesMember =
        filters.member ===
        "All Members" ||
        transaction.member_name ===
        filters.member;


      /*
       * -----------------------------------------
       * CATEGORY
       * -----------------------------------------
       */

      const matchesCategory =
        filters.category ===
        "All Categories" ||
        transaction.category_name ===
        filters.category;


      /*
       * -----------------------------------------
       * PAYMENT MODE
       * -----------------------------------------
       */

      const matchesPaymentMode =
        filters.paymentMode ===
        "All Modes" ||
        transaction.payment_mode_name ===
        filters.paymentMode;


      /*
       * -----------------------------------------
       * DURATION
       * -----------------------------------------
       */

      const transactionDate =
        new Date(
          transaction.transaction_at
        );

      const now = new Date();

      let matchesDuration = true;


      if (
        filters.duration ===
        "Today"
      ) {

        matchesDuration =
          transactionDate.getFullYear() ===
          now.getFullYear() &&
          transactionDate.getMonth() ===
          now.getMonth() &&
          transactionDate.getDate() ===
          now.getDate();

      }


      if (
        filters.duration ===
        "This Week"
      ) {

        const startOfWeek =
          new Date(now);

        const day =
          startOfWeek.getDay();

        const difference =
          day === 0
            ? 6
            : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() -
          difference
        );

        startOfWeek.setHours(
          0,
          0,
          0,
          0
        );

        matchesDuration =
          transactionDate >=
          startOfWeek;

      }


      if (
        filters.duration ===
        "This Month"
      ) {

        matchesDuration =
          transactionDate.getFullYear() ===
          now.getFullYear() &&
          transactionDate.getMonth() ===
          now.getMonth();

      }


      if (
        filters.duration ===
        "This Year"
      ) {

        matchesDuration =
          transactionDate.getFullYear() ===
          now.getFullYear();

      }

      /*
 * -----------------------------------------
 * CUSTOM DATE RANGE
 * -----------------------------------------
 */

      if (
        filters.duration ===
        "Custom Range"
      ) {

        const transactionDay =
          new Date(transactionDate);

        transactionDay.setHours(
          0,
          0,
          0,
          0
        );


        if (filters.fromDate) {

          const from =
            new Date(
              `${filters.fromDate}T00:00:00`
            );

          matchesDuration =
            transactionDay >= from;

        }


        if (
          filters.toDate &&
          matchesDuration
        ) {

          const to =
            new Date(
              `${filters.toDate}T23:59:59`
            );

          matchesDuration =
            transactionDay <= to;

        }

      }


      /*
       * -----------------------------------------
       * FINAL RESULT
       * -----------------------------------------
       */

      return (
        matchesSearch &&
        matchesMember &&
        matchesCategory &&
        matchesPaymentMode &&
        matchesDuration
      );

    });

  const totalFilteredTransactions =
    filteredTransactions.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalFilteredTransactions /
        pageSize
      )
    );

  const paginatedTransactions =
    filteredTransactions.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filters.duration,
    filters.member,
    filters.category,
    filters.paymentMode,
    filters.fromDate,
    filters.toDate
  ]);

  const hasActiveFilters =
  searchTerm.trim() !== "" ||
  filters.duration !== "All Time" ||
  filters.member !== "All Members" ||
  filters.category !== "All Categories" ||
  filters.paymentMode !== "All Modes" ||
  filters.fromDate !== "" ||
  filters.toDate !== "";

  /* -----------------------------------------------
     Cash In
  ------------------------------------------------ */

  const filteredTotalCashIn =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.entry_type === "cash_in"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const filteredTotalCashOut =
    filteredTransactions
      .filter(
        (transaction) =>
          transaction.entry_type === "cash_out"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const filteredNetBalance =
    filteredTotalCashIn -
    filteredTotalCashOut;

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

          members={
            members
          }

          categories={
            categories
          }

          paymentModes={
            paymentModes
          }

          onFiltersChange={
            setFilters
          }

        />


        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
        />


        <FinancialSummary
          totalCashIn={
            filteredTotalCashIn
          }

          totalCashOut={
            filteredTotalCashOut
          }

          netBalance={
            filteredNetBalance
          }
        />


        <TransactionTable

          transactions={
            paginatedTransactions
          }

          loading={
            transactionsLoading
          }

          totalTransactions={
            totalFilteredTransactions
          }

          hasActiveFilters={
            hasActiveFilters
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

          onClearFilters={() => {

            setSearchTerm("");

            setFilters({
              duration: "All Time",
              member: "All Members",
              category: "All Categories",
              paymentMode: "All Modes",
              fromDate: "",
              toDate: ""
            });

          }}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}

          onPageChange={
            setCurrentPage
          }

          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}

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