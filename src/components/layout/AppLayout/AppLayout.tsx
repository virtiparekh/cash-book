import "./AppLayout.css";

import TopHeader from "../../dashboard/TopHeader/TopHeader";
import Sidebar from "../../common/Sidebar/Sidebar";

type Props = {
  children: React.ReactNode;
  userName: string;
  cashBookName: string;
  onLogout: () => void;
};

function AppLayout({
  children,
  userName,
  cashBookName,
  onLogout,
}: Props) {
  return (
    <div className="app-layout">

      <TopHeader
        userName={userName}
        cashBookName={cashBookName}
        onLogout={onLogout}
      />

      <div className="layout-body">

        <Sidebar />

        <main className="layout-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default AppLayout;