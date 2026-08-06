import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "./contexts/AuthContext";

import DashboardPage from "./pages/DashboardPage";
import CashBookSetupPage from "./pages/CashBookSetupPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  const {
    user,
    loading,
    signOut,
  } = useAuth();

  const [authPage, setAuthPage] =
    useState<"login" | "signup">(
      "login"
    );

  const [groupId, setGroupId] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    if (!user) {
      setGroupId(null);
    }
  }, [user]);

  if (loading) {
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

  if (!user) {
    if (
      authPage === "signup"
    ) {
      return (
        <SignupPage
          onShowLogin={() => {
            setAuthPage(
              "login"
            );
          }}
        />
      );
    }

    return (
      <LoginPage
        onShowSignup={() => {
          setAuthPage(
            "signup"
          );
        }}
      />
    );
  }

  if (!groupId) {
    const defaultOwnerName =
      typeof user.user_metadata
        ?.full_name === "string"
        ? user.user_metadata
            .full_name
        : "";

    return (
      <CashBookSetupPage
        defaultOwnerName={
          defaultOwnerName
        }
        onGroupCreated={(
          createdGroupId
        ) => {
          setGroupId(
            createdGroupId
          );
        }}
      />
    );
  }

  return (
    <DashboardPage
      groupId={groupId}
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