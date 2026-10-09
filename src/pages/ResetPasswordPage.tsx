import { useState } from "react";

import "./../styles/LoginPage.css";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

import Popup from "../components/common/Popup/Popup";
import Button from "../components/common/Button/Button";
import Input from "../components/common/Input/Input";
import Card from "../components/common/Card/Card";
import Loader from "../components/common/Loader/Loader";
import Logo from "../components/common/Logo/Logo";

import { appPath } from "../utils/appUrl";

function ResetPasswordPage() {
  const {
    isPasswordRecovery,
    loading: authLoading,
    clearPasswordRecovery,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setShowPopup(false);

    if (!isPasswordRecovery) {
      setErrorMessage(
        "Your password-reset session is invalid or has expired. Please request a new reset link."
      );
      setShowPopup(true);
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Password must contain at least 8 characters."
      );
      setShowPopup(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setShowPopup(true);
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      clearPasswordRecovery();

      setPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Your password has been updated successfully. You can now log in with your new password."
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password. Please request a new reset link."
      );

      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="login-page">
        <div className="login-container">
          <Card className="login-card">
            <Loader text="Checking your password-reset session..." />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      {showPopup && (
        <Popup
          variant="error"
          title="Password Reset Error"
          onClose={() => {
            setShowPopup(false);
            setErrorMessage("");
          }}
        >
          {errorMessage}
        </Popup>
      )}

      <div className="login-container">
        <section className="login-brand">
          <Logo />
          
          <p>Securely reset your account password.</p>
        </section>

        <section>
          <Card className="login-card">
            <h2>Reset Password</h2>

            {!isPasswordRecovery && !successMessage ? (
              <>
                <p>
                  This password-reset session is invalid or has
                  expired. Please request a new reset link.
                </p>

                <div className="login-actions">
                  <Button
                    type="button"
                    onClick={() => {
                      window.location.replace(appPath("/login"));
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p>
                  {successMessage
                    ? "Your password has been changed."
                    : "Enter your new password below."}
                </p>

                {!successMessage && (
                  <form onSubmit={handleResetPassword}>
                    <Input
                      label="New Password"
                      type="password"
                      value={password}
                      placeholder="Enter your new password"
                      disabled={loading}
                      required={true}
                      autoComplete="new-password"
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      placeholder="Confirm your new password"
                      disabled={loading}
                      required={true}
                      autoComplete="new-password"
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                    />

                    <div className="login-actions">
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader text="Updating Password..." />
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {successMessage && (
                  <>
                    <p role="status" aria-live="polite">
                      {successMessage}
                    </p>

                    <div className="login-footer">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          window.location.replace(appPath("/login"));
                        }}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
