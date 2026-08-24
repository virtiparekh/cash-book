import "./AppLayout.css";

import { useState } from "react";

import TopHeader
  from "../../dashboard/TopHeader/TopHeader";

import Sidebar
  from "../../common/Sidebar/Sidebar";

import type {
  CashBookGroup,
} from "../../../types/cashBook";


type Props = {
  children: React.ReactNode;

  userName: string;

  cashBookName: string;

  cashBooks: CashBookGroup[];

  selectedCashBookId: string;

  onCashBookChange: (
    cashBookId: string
  ) => void;

  onLogout: () => void;

  activeItem?: string;

  onNavigate?: (
    item: string
  ) => void;

  // isAdmin?: boolean;
};


function AppLayout({
  children,
  userName,
  cashBookName,
  cashBooks,
  selectedCashBookId,
  onCashBookChange,
  onLogout,
  activeItem = "Dashboard",
  onNavigate,
  // isAdmin = false,
}: Props) {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  const handleNavigate = (
    item: string
  ) => {

    setSidebarOpen(false);

    if (onNavigate) {
      onNavigate(item);
    }

  };


  return (
    <>

      <TopHeader

        userName={
          userName
        }

        cashBookName={
          cashBookName
        }

        cashBooks={
          cashBooks
        }

        selectedCashBookId={
          selectedCashBookId
        }

        onCashBookChange={
          onCashBookChange
        }

        onLogout={
          onLogout
        }

        onMenuClick={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }

      />


      <div className="layout-body">

        <Sidebar

          isOpen={
            sidebarOpen
          }

          onClose={() =>
            setSidebarOpen(false)
          }

          activeItem={
            activeItem
          }

          // isAdmin={isAdmin}

          onNavigate={
            handleNavigate
          }

        />


        <main className="layout-content">

          {children}

        </main>

      </div>

    </>
  );
}


export default AppLayout;