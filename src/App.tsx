import { useEffect, useState } from "react";

import { useAuth } from "./contexts/AuthContext";
import { useCashBookGroups } from "./hooks/useCashBookGroups";
import { useCashBook } from "./hooks/useCashBook";

import { loadCurrentMember }
  from "./services/memberService";

import DashboardPage from "./pages/DashboardPage";
import CashBookSetupPage from "./pages/CashBookSetupPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {

  const {
    user,
    loading: authLoading,
    signOut,
  } = useAuth();

  const {
    groups,
    loading: groupsLoading,
    error,
  } = useCashBookGroups();

  const {
    selectedCashBook,
    setSelectedCashBook,
    setCurrentMember,
  } = useCashBook();

  const [
    authPage,
    setAuthPage,
  ] = useState<"login" | "signup">(
    "login"
  );

  useEffect(() => {

    if (
      groups.length > 0 &&
      !selectedCashBook
    ) {

      setSelectedCashBook(
        groups[0]
      );

    }

  }, [
    groups,
    selectedCashBook,
    setSelectedCashBook,
  ]);

  useEffect(() => {

    async function initialiseCurrentMember() {

      if (!selectedCashBook) {
        return;
      }

      try {

        const member =
          await loadCurrentMember(
            selectedCashBook.id
          );

        setCurrentMember(member);

      }

      catch (error) {

        console.error(
          "Unable to load current member.",
          error
        );

      }

    }

    void initialiseCurrentMember();

  }, [
    selectedCashBook,
    setCurrentMember,
  ]);

  // Authentication loading
  if (authLoading) {

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

  // Login / Signup
  if (!user) {

    if (
      authPage === "signup"
    ) {

      return (

        <SignupPage
          onShowLogin={() =>
            setAuthPage(
              "login"
            )
          }
        />

      );

    }

    return (

      <LoginPage
        onShowSignup={() =>
          setAuthPage(
            "signup"
          )
        }
      />

    );

  }

  // Cash Book loading
  if (groupsLoading) {

    return (

      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >

        <p>
          Loading your Cash Books...
        </p>

      </main>

    );

  }

  // Error
  if (error) {

    return (

      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >

        <div>

          <h2>
            Unable to load your Cash Books
          </h2>

          <p>
            {error}
          </p>

        </div>

      </main>

    );

  }

  // First Login
  if (
    groups.length === 0
  ) {

    const defaultOwnerName =
      typeof user.user_metadata
        ?.full_name === "string"
        ? user.user_metadata.full_name
        : "";

    return (

      <CashBookSetupPage
        defaultOwnerName={
          defaultOwnerName
        }
        onGroupCreated={() => {
          // Future refresh
        }}
      />

    );

  }

  if (!selectedCashBook) {

    return (

      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >

        <p>
          Loading your Cash Book...
        </p>

      </main>

    );

  }

  return (

    <DashboardPage
      userEmail={
        user.email ?? ""
      }
      onLogout={() => {
        void signOut();
      }}
    />

  );

}

export default App;