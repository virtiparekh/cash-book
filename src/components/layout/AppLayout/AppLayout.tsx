import "./AppLayout.css";

import { useState } from "react";

import TopHeader
  from "../../dashboard/TopHeader/TopHeader";

import Sidebar
  from "../../common/Sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
  userName: string;
  cashBookName: string;
  onLogout: () => void;
  activeItem?: string;
  onNavigate?: (item: string) => void;
  // isAdmin?: boolean;
};

function AppLayout({
  children,
  userName,
  cashBookName,
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
        userName={userName}
        cashBookName={cashBookName}
        onLogout={onLogout}
        onMenuClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <div className="layout-body">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
          activeItem={activeItem}
          // isAdmin={isAdmin}
          onNavigate={handleNavigate}
        />

        <main className="layout-content">
          {children}
        </main>

      </div>
    </>
  );
}

export default AppLayout;