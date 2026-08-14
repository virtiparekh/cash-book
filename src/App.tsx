import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "./contexts/AuthContext";

import {
  useCashBookGroups,
} from "./hooks/useCashBookGroups";

import {
  useCashBook,
} from "./hooks/useCashBook";

import {
  loadCurrentMember,
} from "./services/memberService";

import DashboardPage
  from "./pages/DashboardPage";

import CashBookSetupPage
  from "./pages/CashBookSetupPage";

import LoginPage
  from "./pages/LoginPage";

import SignupPage
  from "./pages/SignupPage";

import AcceptInvitationPage
  from "./pages/AcceptInvitationPage";

import { appPath } from "./utils/appUrl";
function App() {

  /*
   * -------------------------------------------------
   * Current route
   * -------------------------------------------------
   */

  const rawPath =
    window.location.pathname;

  const currentPath =
    rawPath.startsWith("/cash-book")
      ? rawPath.slice("/cash-book".length) || "/"
      : rawPath;


  const currentSearch =
    window.location.search;


  /*
   * -------------------------------------------------
   * Invitation route
   * -------------------------------------------------
   */

  const isInvitationPage =
    currentPath === "/invite";


  /*
   * -------------------------------------------------
   * Login route
   * -------------------------------------------------
   */

  const isLoginPage =
    currentPath === "/login";


  /*
   * -------------------------------------------------
   * Signup route
   * -------------------------------------------------
   */

  const isSignupPage =
    currentPath === "/signup";


  /*
   * -------------------------------------------------
   * Authentication
   * -------------------------------------------------
   */

  const {
    user,
    loading: authLoading,
    signOut,
  } = useAuth();


  /*
   * -------------------------------------------------
   * Cash Book groups
   * -------------------------------------------------
   */

  const {
    groups,
    loading: groupsLoading,
    error,
  } = useCashBookGroups();


  /*
   * -------------------------------------------------
   * Cash Book context
   * -------------------------------------------------
   */

  const {
    selectedCashBook,
    setSelectedCashBook,
    setCurrentMember,
  } = useCashBook();


  /*
   * -------------------------------------------------
   * Auth page
   * -------------------------------------------------
   */

  const [
    authPage,
    setAuthPage,
  ] =
    useState<
      "login" | "signup"
    >(
      isSignupPage
        ? "signup"
        : "login"
    );


  /*
   * -------------------------------------------------
   * Return URL
   * -------------------------------------------------
   *
   * Normal example:
   *
   * /login?returnTo=/dashboard
   *
   * Invitation example:
   *
   * /login?returnTo=%2Finvite%3Ftoken%3DXXX
   *
   * IMPORTANT:
   *
   * If the user is coming directly from
   * /invite?token=XXX, we automatically create
   * the returnTo value.
   * -------------------------------------------------
   */

  const [
    returnTo,
    setReturnTo,
  ] = useState<string | null>(
    () => {

      const params =
        new URLSearchParams(
          window.location.search
        );


      const existingReturnTo =
        params.get(
          "returnTo"
        );


      if (existingReturnTo) {

        return existingReturnTo;

      }


      /*
       * Direct invitation URL
       */

      if (
        currentPath === "/invite"
      ) {

        const token =
          params.get(
            "token"
          );


        if (token) {

          return appPath(
            `${currentPath}${currentSearch}`
          );

        }

      }


      return null;

    }
  );


  /*
   * -------------------------------------------------
   * Invitation token
   * -------------------------------------------------
   */

  const invitationToken =
    new URLSearchParams(
      currentSearch
    ).get(
      "token"
    );


  /*
   * -------------------------------------------------
   * Redirect unauthenticated invitation user
   * -------------------------------------------------
   *
   * User opens:
   *
   * /invite?token=XXX
   *
   * but is not logged in.
   *
   * We send them to:
   *
   * /login?returnTo=%2Finvite%3Ftoken%3DXXX
   *
   * This preserves the invitation.
   * -------------------------------------------------
   */

  useEffect(() => {

    if (
      authLoading
    ) {

      return;

    }


    if (
      !isInvitationPage
    ) {

      return;

    }


    if (
      user
    ) {

      return;

    }


    if (
      !invitationToken
    ) {

      return;

    }


    const invitationUrl =
      `${currentPath}${currentSearch}`;


    const loginUrl =
      appPath(`/login?returnTo=${encodeURIComponent(
        invitationUrl
      )}`);


    window.location.replace(
      loginUrl
    );

  }, [
    authLoading,
    user,
    isInvitationPage,
    invitationToken,
    currentPath,
    currentSearch,
  ]);


  /*
   * -------------------------------------------------
   * Select first Cash Book
   * -------------------------------------------------
   */

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


  /*
   * -------------------------------------------------
   * Load current member
   * -------------------------------------------------
   */

  useEffect(() => {

    async function
    initialiseCurrentMember() {

      if (
        !selectedCashBook
      ) {

        return;

      }


      try {

        const member =
          await loadCurrentMember(
            selectedCashBook.id
          );


        setCurrentMember(
          member
        );


      } catch (error) {

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


  /*
   * -------------------------------------------------
   * Authentication loading
   * -------------------------------------------------
   */

  if (
    authLoading
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
   * LOGIN / SIGNUP ROUTES
   * -------------------------------------------------
   */

  if (
    isLoginPage ||
    isSignupPage
  ) {


    /*
     * -------------------------------------------------
     * Already authenticated
     *
     * If returnTo exists, go back to it.
     * -------------------------------------------------
     */

    if (
      user &&
      returnTo
    ) {

      const destination =
        returnTo;


      setReturnTo(
        null
      );


      window.location.href =
        destination;


      return (

        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
          }}
        >

          <p>
            Returning...
          </p>

        </main>

      );

    }


    /*
     * -------------------------------------------------
     * LOGIN
     * -------------------------------------------------
     */

    if (
      isLoginPage &&
      authPage !== "signup"
    ) {

      return (

        <LoginPage

          onShowSignup={() => {

            setAuthPage(
              "signup"
            );


            const currentReturnTo =
              returnTo;


            if (
              currentReturnTo
            ) {

              window.history.pushState(
                {},
                "",
                appPath(`/signup?returnTo=${encodeURIComponent(
                  currentReturnTo
                )}`)
              );

            } else {

              window.history.pushState(
                {},
                "",
                appPath("/signup")
              );

            }

          }}


          onLoginSuccess={() => {

            /*
             * If this login came from an invitation,
             * return to the invitation.
             */

            if (
              returnTo
            ) {

              window.location.href =
                returnTo;

              return;

            }


            /*
             * Normal login.
             */

            window.location.href =
              appPath("/dashboard");

          }}

        />

      );

    }


    /*
     * -------------------------------------------------
     * SIGNUP
     * -------------------------------------------------
     */

    if (
      isSignupPage ||
      authPage === "signup"
    ) {

      return (

        <SignupPage

          onShowLogin={() => {

            setAuthPage(
              "login"
            );


            const currentReturnTo =
              returnTo;


            if (
              currentReturnTo
            ) {

              window.history.pushState(
                {},
                "",
                appPath(`/login?returnTo=${encodeURIComponent(
                  currentReturnTo
                )}`)
              );

            } else {

              window.history.pushState(
                {},
                "",
                appPath("/login")
              );

            }

          }}


          onSignupSuccess={() => {

            /*
             * Signup does not automatically
             * accept the invitation.
             *
             * User must login first.
             */

            if (
              returnTo
            ) {

              window.location.href =
                appPath(`/login?returnTo=${encodeURIComponent(
                  returnTo
                )}`);

              return;

            }


            /*
             * Normal signup.
             */

            window.location.href =
              appPath("/login");

          }}

        />

      );

    }

  }


  /*
   * -------------------------------------------------
   * INVITATION PAGE
   * -------------------------------------------------
   *
   * At this point:
   *
   * 1. Authentication loading is complete.
   *
   * 2. If user was not logged in, the effect above
   *    redirected them to Login.
   *
   * 3. If user is logged in, we can safely show
   *    AcceptInvitationPage.
   * -------------------------------------------------
   */

  if (
    isInvitationPage
  ) {

    /*
     * Invalid invitation URL
     */

    if (
      !invitationToken
    ) {

      return (

        <section
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
          }}
        >

          <div>

            <h2>
              Invalid Invitation
            </h2>

            <p>
              This invitation link is missing
              a valid invitation token.
            </p>

          </div>

        </section>

      );

    }


    /*
     * Still waiting for redirect of
     * unauthenticated user.
     */

    if (
      !user
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
            Redirecting to login...
          </p>

        </main>

      );

    }


    /*
     * Authenticated user
     */

    return (
      <AcceptInvitationPage />
    );

  }


  /*
   * -------------------------------------------------
   * ROOT ROUTE
   * -------------------------------------------------
   */

  if (
    currentPath === "/"
  ) {

    window.location.href =
      appPath("/login");


    return null;

  }


  /*
   * -------------------------------------------------
   * USER NOT LOGGED IN
   * -------------------------------------------------
   */

 if (!user) {

  /*
   * User is not authenticated.
   *
   * If the current route is not an authentication
   * route, redirect the browser to /login.
   */

  if (
    currentPath !== "/login" &&
    currentPath !== "/signup"
  ) {

    window.location.href =
      appPath("/login");

    return null;

  }


  /*
   * Normal login
   */

  if (
    currentPath === "/login"
  ) {

    return (

      <LoginPage

        onShowSignup={() => {

          window.location.href =
            appPath("/signup");

        }}

      />

    );

  }


  /*
   * Normal signup
   */

  return (

    <SignupPage

      onShowLogin={() => {

        window.location.href =
          appPath("/login");

      }}

    />

  );

}


  /*
   * -------------------------------------------------
   * CASH BOOK LOADING
   * -------------------------------------------------
   */

  if (
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
          Loading your Cash Books...
        </p>

      </main>

    );

  }


  /*
   * -------------------------------------------------
   * CASH BOOK ERROR
   * -------------------------------------------------
   */

  if (
    error
  ) {

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


  /*
   * -------------------------------------------------
   * FIRST LOGIN / SETUP
   * -------------------------------------------------
   */

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
          /*
           * Future refresh.
           */
        }}

      />

    );

  }


  /*
   * -------------------------------------------------
   * NO SELECTED CASH BOOK
   * -------------------------------------------------
   */

  if (
    !selectedCashBook
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
          Loading your Cash Book...
        </p>

      </main>

    );

  }


  /*
   * -------------------------------------------------
   * DASHBOARD
   * -------------------------------------------------
   */

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