import { useState } from "react";

import { useAuth } from "./contexts/AuthContext";
import { useCashBookGroups } from "./hooks/useCashBookGroups";

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

  const [authPage, setAuthPage] = useState<"login" | "signup">("login");

  // Temporary debugging
  console.log("Groups:", groups);

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
        <p>Loading Family Cash Book...</p>
      </main>
    );
  }

  // Login / Signup
  if (!user) {
    if (authPage === "signup") {
      return (
        <SignupPage
          onShowLogin={() => {
            setAuthPage("login");
          }}
        />
      );
    }

    return (
      <LoginPage
        onShowSignup={() => {
          setAuthPage("signup");
        }}
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
        <p>Loading your Cash Books...</p>
      </main>
    );
  }

  // Error while loading groups
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
          <h2>Unable to load your Cash Books</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  // First-time user
  if (groups.length === 0) {
    const defaultOwnerName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "";

    return (
      <CashBookSetupPage
        defaultOwnerName={defaultOwnerName}
        onGroupCreated={() => {
          // Nothing required.
          // useCashBookGroups() will automatically reload
          // in the next phase.
        }}
      />
    );
  }

  // Dashboard
  return (
    <DashboardPage
      userEmail={user.email ?? ""}
      onLogout={() => {
        void signOut();
      }}
    />
  );
}

export default App;