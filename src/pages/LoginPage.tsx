import {
//   FormEvent,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

type LoginPageProps = {
  onShowSignup: () => void;
};

function LoginPage({
  onShowSignup,
}: LoginPageProps) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setErrorMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        error,
      } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "32px",
          border: "1px solid #d1d5db",
          borderRadius: "16px",
        }}
      >
        <h1>Family Cash Book</h1>

        <h2>Welcome back</h2>

        <p>
          Log in to access your family
          cash books.
        </p>

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px",
              border: "1px solid #dc2626",
              borderRadius: "8px",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleLogin}
        >
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <label htmlFor="loginEmail">
              Email Address
            </label>

            <input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value
                );
              }}
              placeholder="name@example.com"
              autoComplete="email"
              disabled={loading}
              required
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label htmlFor="loginPassword">
              Password
            </label>

            <input
              id="loginPassword"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(
                  event.target.value
                );
              }}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              required
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "12px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              cursor: loading
                ? "wait"
                : "pointer",
            }}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
          }}
        >
          New to Family Cash Book?{" "}

          <button
            type="button"
            onClick={onShowSignup}
            disabled={loading}
          >
            Create an account
          </button>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;