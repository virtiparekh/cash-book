import { useState } from "react";
import "./../styles/LoginPage.css";

import Logo from "../components/common/Logo/Logo";
import { supabase } from "../lib/supabase";
import Popup from "../components/common/Popup/Popup";
import Button from "../components/common/Button/Button";
import Input from "../components/common/Input/Input";
import Card from "../components/common/Card/Card";
import Loader from "../components/common/Loader/Loader";
import { appPath } from "../utils/appUrl";


type LoginPageProps = {
  onShowSignup: () => void;
  onLoginSuccess?: () => void;
};


function LoginPage({
  onShowSignup,
  onLoginSuccess,
}: LoginPageProps) {

  const [
    loginId,
    setLoginId,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const [
    showPopup,
    setShowPopup,
  ] = useState(false);


  /*
   * -------------------------------------------------
   * Login
   * -------------------------------------------------
   *
   * User can login using:
   *
   * Email + Password
   *
   * OR
   *
   * Phone Number + Password
   *
   * -------------------------------------------------
   */

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {

    event.preventDefault();


    setErrorMessage("");
    setShowPopup(false);


    const trimmedLoginId =
      loginId.trim();


    /*
     * -------------------------------------------------
     * Basic validation
     * -------------------------------------------------
     */

    if (!trimmedLoginId) {

      setErrorMessage(
        "Please enter your email address or phone number."
      );

      setShowPopup(true);

      return;

    }


    if (!password) {

      setErrorMessage(
        "Please enter your password."
      );

      setShowPopup(true);

      return;

    }


    /*
     * -------------------------------------------------
     * Determine whether login ID is email or phone
     * -------------------------------------------------
     */

    const isPhone =
      /^[0-9]{10}$/.test(
        trimmedLoginId
      );


    const isEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedLoginId
      );


    if (
      !isPhone &&
      !isEmail
    ) {

      setErrorMessage(
        "Please enter a valid email address or 10-digit phone number."
      );

      setShowPopup(true);

      return;

    }


    /*
     * -------------------------------------------------
     * Login
     * -------------------------------------------------
     */

    try {

      setLoading(true);


      if (isPhone) {

        /*
         * -------------------------------------------------
         * Phone login
         * -------------------------------------------------
         *
         * Supabase expects an international
         * phone number format.
         *
         * For India:
         *
         * 9876543210
         *
         * becomes:
         *
         * +919876543210
         * -------------------------------------------------
         */

        const phone =
          `+91${trimmedLoginId}`;


        const {
          error,
        } =
          await supabase.auth.signInWithPassword({
            phone,
            password,
          });


        if (error) {

          throw error;

        }

      } else {

        /*
         * -------------------------------------------------
         * Email login
         * -------------------------------------------------
         */

        const {
          error,
        } =
          await supabase.auth.signInWithPassword({
            email:
              trimmedLoginId.toLowerCase(),
            password,
          });


        if (error) {

          throw error;

        }

      }


      /*
       * -------------------------------------------------
       * Authentication succeeded
       * -------------------------------------------------
       *
       * If this login came from an invitation,
       * return to the invitation page.
       * -------------------------------------------------
       */

      const invitationReturnUrl =
        sessionStorage.getItem(
          "invitation_return_url"
        );


      if (invitationReturnUrl) {

        sessionStorage.removeItem(
          "invitation_return_url"
        );


        /*
         * invitationReturnUrl may already contain
         * /cash-book because it was created using
         * appPath().
         *
         * Therefore do NOT call appPath() again here.
         */

        window.location.href =
          appPath(invitationReturnUrl);

        return;

      }


      /*
       * -------------------------------------------------
       * Normal login
       * -------------------------------------------------
       */

      onLoginSuccess?.();


    } catch (error: unknown) {

      const message =
        error instanceof Error
          ? error.message
          : "Unable to login.";


      setErrorMessage(
        message
      );


      setShowPopup(true);


    } finally {

      setLoading(false);

    }

  };


  return (

    <main className="login-page">


      {/* -------------------------------------------------
          Login Error Popup
         ------------------------------------------------- */}

      {showPopup && (

        <Popup
          variant="error"
          title="Login Error"
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


            <form
              onSubmit={handleLogin}
            >


              <Input
                label="Email or Phone Number"
                type="text"
                value={loginId}
                placeholder="Email or 10-digit phone number"
                disabled={loading}
                required={true}
                autoComplete="username"
                onChange={(event) =>
                  setLoginId(
                    event.target.value
                  )
                }
              />


              <Input
                label="Password"
                type="password"
                value={password}
                placeholder="Enter your password"
                disabled={loading}
                required={true}
                autoComplete="current-password"
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
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

                    <Loader
                      text="Logging In..."
                    />

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


              <Button
                variant="secondary"
                onClick={onShowSignup}
              >

                Create Account

              </Button>


              <p>
                Login using your registered
                email address or phone number.
              </p>


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