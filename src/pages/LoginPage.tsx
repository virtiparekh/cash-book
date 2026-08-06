import { useState } from "react";
import "./../styles/LoginPage.css";
import Logo from "../components/common/Logo/Logo";
import { supabase } from "../lib/supabase";
import Button from "../components/common/Button/Button";
import Input from "../components/common/Input/Input";
import Card from "../components/common/Card/Card";
import Alert from "../components/common/Alert/Alert";
import Loader from "../components/common/Loader/Loader";

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

      const { error } =
        await supabase.auth.signInWithPassword({
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
          : "Unable to login.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-container">

        <section className="login-brand">

          <Logo />

          <p>
            A simple and secure way
            for your family to manage
            income, expenses and
            shared cash books together.
          </p>

        </section>

        <section>
          <Card className="login-card">
            <h2>
              Welcome Back
            </h2>

            <p>
              Login to continue
            </p>

            {errorMessage && (
              <Alert variant="error">
                {errorMessage}
              </Alert>
            )}

            <form
              onSubmit={handleLogin}
            >

              <Input
                label="Email Address"
                type="email"
                value={email}
                placeholder="name@example.com"
                disabled={loading}
                required={true}
                autoComplete="email"
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              <Input
                label="Password"
                type="password"
                value={password}
                placeholder="Enter password"
                disabled={loading}
                required={true}
                autoComplete="current-password"
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <div className="login-options">

                <label className="remember-me">

                  <input
                    type="checkbox"
                  />

                  {" "}
                  Remember Me

                </label>

              </div>

              <div className="login-actions">

                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader text="Logging In..." />
                  ) : (
                    "Login"
                  )}
                </Button>

              </div>

            </form>

            <div className="login-footer">

              <p>

                Don't have an account?

              </p>
              <p>
                Secure login powered by Supabase Authentication.
              </p>

              <Button
                variant="secondary"
                onClick={onShowSignup}
              >
                Create Account
              </Button>

              <div className="login-bottom-text">
                © 2026 Family Cash Book
              </div>

            </div>
          </Card>

        </section>

      </div>

    </main>
  );
}

export default LoginPage;