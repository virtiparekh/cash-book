import "./../styles/DashboardPage.css";
import FinancialSummary from "../components/dashboard/FinancialSummary/FinancialSummary";
import { useCashBook } from "../hooks/useCashBook";
import DashboardHeader from "../components/dashboard/DashboardHeader/DashboardHeader";
import AppLayout from "../components/layout/AppLayout/AppLayout";
import CashBookToolbar
  from "../components/dashboard/CashBookToolbar/CashBookToolbar";
import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import TransactionDrawer
  from "../components/dashboard/TransactionDrawer/TransactionDrawer";
import SearchBar
  from "../components/dashboard/SearchBar/SearchBar";

import TransactionTable
  from "../components/dashboard/TransactionTable/TransactionTable";

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

    loading: transactionsLoading,

  } = useTransactions(
    selectedCashBook?.id
  );

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [transactionType,
    setTransactionType] =
    useState<"cash-in" | "cash-out">(
      "cash-in"
    );

  const handleCashIn = () => {

    setTransactionType(
      "cash-in"
    );

    setDrawerOpen(true);

  };

  const handleCashOut = () => {

    setTransactionType(
      "cash-out"
    );

    setDrawerOpen(true);

  };

  return (
    <AppLayout
      userName={userEmail}
      cashBookName={selectedCashBook?.name ?? ""}
      onLogout={onLogout}>

      <div className="dashboard-container">

        <DashboardHeader
          title={
            selectedCashBook?.name ??
            "Cash Book"
          }
          subtitle={`Welcome ${userEmail}`}
        />

        <CashBookToolbar
          onCashIn={handleCashIn}
          onCashOut={handleCashOut} />

        <SearchBar />
        <FinancialSummary totalCashIn={0}
          totalCashOut={0}
          netBalance={0}
        />

        <TransactionTable
          transactions={transactions}
          loading={transactionsLoading}
        />

        {/* Summary cards will come here */}

        {/* Quick Actions */}

        {/* Recent Transactions */}
      </div>
      <TransactionDrawer
        open={drawerOpen}
        type={transactionType}
        onClose={() =>
          setDrawerOpen(false)
        }
      />
    </AppLayout>
  );
}

export default DashboardPage;