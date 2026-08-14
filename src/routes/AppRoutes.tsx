import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import CashBookSetupPage from "../pages/CashBookSetupPage";
import DashboardPage from "../pages/DashboardPage";

import { useAuth } from "../contexts/AuthContext";
import { useCashBookGroups } from "../hooks/useCashBookGroups";

export default function AppRoutes() {
  const {
    user,
    loading,
    signOut,
  } = useAuth();

  const {
    loading: groupsLoading,
  } = useCashBookGroups();

  if (loading || groupsLoading) {
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

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={
          <LoginPage
            onShowSignup={() => {}}
          />
        }
      />

      <Route
        path="/signup"
        element={
          <SignupPage
            onShowLogin={() => {}}
          />
        }
      />

      <Route
        path="/setup"
        element={
          <CashBookSetupPage
            defaultOwnerName=""
            onGroupCreated={() => {}}
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <DashboardPage
            userEmail={user?.email ?? ""}
            onLogout={() => {
              void signOut();
            }}
          />
        }
      />
    </Routes>
  );
}