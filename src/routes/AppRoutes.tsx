import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage
  from "../pages/LoginPage";

import SignupPage
  from "../pages/SignupPage";

import CashBookSetupPage
  from "../pages/CashBookSetupPage";

import DashboardPage
  from "../pages/DashboardPage";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  useCashBookGroups,
} from "../hooks/useCashBookGroups";

import {
  useCashBook,
} from "../hooks/useCashBook";


export default function AppRoutes() {

  const {
    user,
    loading,
    signOut,
  } = useAuth();


  const {
    groups,
    loading: groupsLoading,
  } = useCashBookGroups();


  const {
    selectedCashBook,
    setSelectedCashBook,
  } = useCashBook();


  /*
   * -------------------------------------------------
   * Cash Book selection
   * -------------------------------------------------
   */

  const handleCashBookChange = (
    cashBookId: string
  ) => {

    const cashBook =
      groups.find(
        (group) =>
          group.id === cashBookId
      );

    if (cashBook) {

      setSelectedCashBook(
        cashBook
      );

    }

  };


  /*
   * -------------------------------------------------
   * Loading
   * -------------------------------------------------
   */

  if (
    loading ||
    groupsLoading
  ) {

    return (

      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >

        <p>
          Loading Family Cash Book...
        </p>

      </main>

    );

  }


  /*
   * -------------------------------------------------
   * Routes
   * -------------------------------------------------
   */

  return (

    <Routes>

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      <Route
        path="/login"
        element={
          <LoginPage
            onShowSignup={() => { }}
          />
        }
      />


      <Route
        path="/signup"
        element={
          <SignupPage
            onShowLogin={() => { }}
          />
        }
      />


      <Route
        path="/setup"
        element={
          <CashBookSetupPage
            defaultOwnerName=""
            onGroupCreated={() => { }}
          />
        }
      />


      <Route
        path="/dashboard"
        element={
          selectedCashBook ? (
            <DashboardPage
              userEmail={user?.email ?? ""}
              selectedCashBook={selectedCashBook}
              cashBooks={groups}
              onCashBookChange={handleCashBookChange}
              onLogout={() => {
                void signOut();
              }}
            />
          ) : (
            <Navigate
              to="/setup"
              replace
            />
          )
        }
      />
    </Routes>

  );

}