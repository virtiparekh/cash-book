import "./../styles/AcceptInvitationPage.css";

import {
    useEffect,
    useState,
} from "react";

import {
    supabase,
} from "../lib/supabase";

import {
    getInvitationByToken,
    acceptGroupInvitation,
} from "../services/invitationService";

import type {
    GroupInvitation,
} from "../services/invitationService";

import { appPath } from "../utils/appUrl";
function AcceptInvitationPage() {

    /*
     * -------------------------------------------------
     * Invitation token
     * -------------------------------------------------
     */

    const token =
        new URLSearchParams(
            window.location.search
        ).get("token");


    /*
     * -------------------------------------------------
     * State
     * -------------------------------------------------
     */

    const [
        invitation,
        setInvitation,
    ] = useState<GroupInvitation | null>(
        null
    );


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        accepting,
        setAccepting,
    ] = useState(false);


    const [
        checkingUser,
        setCheckingUser,
    ] = useState(true);


    const [
        loggedIn,
        setLoggedIn,
    ] = useState(false);


    const [
        identityMatches,
        setIdentityMatches,
    ] = useState(false);


    const [
        currentUserEmail,
        setCurrentUserEmail,
    ] = useState<string | null>(
        null
    );


    const [
        currentUserPhone,
        setCurrentUserPhone,
    ] = useState<string | null>(
        null
    );


    const [
        success,
        setSuccess,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /*
     * -------------------------------------------------
     * Normalize phone number
     * -------------------------------------------------
     */

    const normalizePhone = (
        phone: string | null | undefined
    ): string => {

        if (!phone) {
            return "";
        }

        return phone.replace(
            /\D/g,
            ""
        );

    };


    /*
     * -------------------------------------------------
     * Check whether current user matches
     * invitation identity
     * -------------------------------------------------
     */

    const checkIdentity = async (
        currentInvitation: GroupInvitation
    ): Promise<void> => {

        try {

            setCheckingUser(true);


            const {
                data,
                error: authError,
            } =
                await supabase.auth.getUser();


            if (
                authError ||
                !data.user
            ) {

                setLoggedIn(false);
                setIdentityMatches(false);
                setCurrentUserEmail(null);
                setCurrentUserPhone(null);

                return;

            }


            const user =
                data.user;


            setLoggedIn(true);


            const userEmail =
                user.email
                    ?.trim()
                    .toLowerCase() ||
                null;


            /*
             * contact_no was stored during signup
             * in user_metadata.
             *
             * We use it as the first phone source.
             */

            const metadataPhone =
                user.user_metadata
                    ?.contact_no
                    ?.toString()
                    .trim() ||
                "";


            const normalizedUserPhone =
                normalizePhone(
                    metadataPhone
                );


            const normalizedInvitationPhone =
                normalizePhone(
                    currentInvitation.phone
                );


            setCurrentUserEmail(
                userEmail
            );


            setCurrentUserPhone(
                normalizedUserPhone ||
                null
            );


            /*
             * -------------------------------------------------
             * Email invitation
             * -------------------------------------------------
             */

            if (
                currentInvitation.email
            ) {

                const invitationEmail =
                    currentInvitation.email
                        .trim()
                        .toLowerCase();


                const matches =
                    userEmail ===
                    invitationEmail;


                setIdentityMatches(
                    matches
                );

                return;

            }


            /*
             * -------------------------------------------------
             * Phone invitation
             * -------------------------------------------------
             */

            if (
                currentInvitation.phone
            ) {

                const matches =
                    normalizedUserPhone ===
                    normalizedInvitationPhone;


                setIdentityMatches(
                    matches
                );

                return;

            }


            /*
             * No identity available.
             */

            setIdentityMatches(
                false
            );

        } finally {

            setCheckingUser(false);

        }

    };


    /*
     * -------------------------------------------------
     * Load invitation
     * -------------------------------------------------
     */

    useEffect(() => {

        let cancelled = false;


        const loadInvitation =
            async () => {

                if (!token) {

                    if (!cancelled) {

                        setError(
                            "Invalid invitation link."
                        );

                        setLoading(false);

                    }

                    return;

                }


                try {

                    setLoading(true);
                    setError(null);

                    console.log("INVITATION TOKEN:", token);
                    const data =
                        await getInvitationByToken(
                            token
                        );

                    console.log(
                        "INVITATION DATA:",
                        data
                    );
                    if (!data) {

                        throw new Error(
                            "Invitation not found."
                        );

                    }


                    /*
                     * Invitation status
                     */

                    if (
                        data.status !==
                        "pending"
                    ) {

                        throw new Error(
                            `This invitation is already ${data.status}.`
                        );

                    }


                    /*
                     * Invitation expiry
                     */

                    if (
                        new Date(
                            data.expires_at
                        ).getTime() <=
                        Date.now()
                    ) {

                        throw new Error(
                            "This invitation has expired."
                        );

                    }


                    if (!cancelled) {

                        setInvitation(
                            data
                        );

                    }


                    /*
                     * Check logged-in user
                     */

                    await checkIdentity(
                        data
                    );

                } catch (error) {

                    console.error(
                        "Unable to load invitation.",
                        error
                    );


                    if (!cancelled) {

                        setError(
                            error instanceof Error
                                ? error.message
                                : "Unable to load invitation."
                        );

                    }

                } finally {

                    if (!cancelled) {

                        setLoading(false);

                    }

                }

            };


        void loadInvitation();


        return () => {

            cancelled = true;

        };

    }, [token]);


    /*
     * -------------------------------------------------
     * Listen for authentication changes
     *
     * This is important after Login / Signup.
     * -------------------------------------------------
     */

    useEffect(() => {

        if (!invitation) {
            return;
        }


        const {
            data: authListener,
        } =
            supabase.auth.onAuthStateChange(
                async () => {

                    await checkIdentity(
                        invitation
                    );

                }
            );


        return () => {

            authListener.subscription.unsubscribe();

        };

    }, [
        invitation,
    ]);


    /*
     * -------------------------------------------------
     * Save invitation return URL
     * -------------------------------------------------
     */

    const saveInvitationReturnUrl =
        () => {

            if (!token) {
                return;
            }


            const returnUrl =
                appPath(`/invite?token=${encodeURIComponent(
                    token
                )}`);


            sessionStorage.setItem(
                "invitation_return_url",
                returnUrl
            );

        };


    /*
     * -------------------------------------------------
     * Go to Login
     * -------------------------------------------------
     */

    const handleLogin =
        () => {

            saveInvitationReturnUrl();


            window.location.href =
                appPath("/login");

        };


    /*
     * -------------------------------------------------
     * Go to Signup
     * -------------------------------------------------
     */

    const handleSignup =
        () => {

            saveInvitationReturnUrl();


            window.location.href =
                appPath("/signup");

        };


    /*
     * -------------------------------------------------
     * Sign out wrong user
     * -------------------------------------------------
     */

    const handleSignOut =
        async () => {

            try {

                await supabase.auth.signOut();

                setLoggedIn(false);
                setIdentityMatches(false);

                setCurrentUserEmail(null);
                setCurrentUserPhone(null);

            } catch (error) {

                console.error(
                    "Unable to sign out.",
                    error
                );

                setError(
                    "Unable to sign out. Please try again."
                );

            }

        };


    /*
     * -------------------------------------------------
     * Accept invitation
     * -------------------------------------------------
     */

    const handleAccept =
        async () => {

            if (!token) {
                return;
            }


            if (!loggedIn) {

                setError(
                    "Please login or create an account before accepting the invitation."
                );

                return;

            }


            if (!identityMatches) {

                setError(
                    "You are logged in with a different account. Please sign in using the account that received this invitation."
                );

                return;

            }


            try {

                setAccepting(true);
                setError(null);


                await acceptGroupInvitation(
                    token
                );


                setSuccess(true);

            } catch (error) {

                console.error(
                    "Unable to accept invitation.",
                    error
                );


                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to accept invitation."
                );

            } finally {

                setAccepting(false);

            }

        };


    /*
* -------------------------------------------------
* Go to Dashboard
* -------------------------------------------------
*/

    const handleGoToDashboard = () => {

        window.location.href =
            appPath("/dashboard");

    };
    /*
     * -------------------------------------------------
     * Loading
     * -------------------------------------------------
     */

    if (loading) {

        return (

            <section className="accept-invitation-page">

                <div className="accept-invitation-card">

                    <h1>
                        Checking Invitation...
                    </h1>

                    <p>
                        Please wait while we verify
                        your invitation.
                    </p>

                </div>

            </section>

        );

    }


    /*
     * -------------------------------------------------
     * Error
     * -------------------------------------------------
     */

    if (error && !invitation) {

        return (

            <section className="accept-invitation-page">

                <div className="accept-invitation-card">

                    <div className="accept-error-icon">
                        !
                    </div>

                    <h1>
                        Invitation Unavailable
                    </h1>

                    <p>
                        {error}
                    </p>

                </div>

            </section>

        );

    }


    /*
     * -------------------------------------------------
     * Success
     * -------------------------------------------------
     */

    if (success) {

        return (

            <section className="accept-invitation-page">

                <div className="accept-invitation-card">

                    <div className="accept-success-icon">
                        ✓
                    </div>

                    <h1>
                        Invitation Accepted
                    </h1>

                    <p>
                        You have successfully joined
                        the Cash Book.
                    </p>

                    <p>
                        You can now access the Cash Book
                        as a member.
                    </p>


                    <button
                        type="button"
                        className="accept-invitation-button"
                        onClick={handleGoToDashboard}
                    >
                        Go to Dashboard
                    </button>

                </div>

            </section>

        );

    }


    /*
     * -------------------------------------------------
     * Invitation content
     * -------------------------------------------------
     */

    return (

        <section className="accept-invitation-page">

            <div className="accept-invitation-card">

                <div className="accept-invitation-icon">
                    👥
                </div>


                <h1>
                    Join Cash Book
                </h1>


                <p>
                    You have been invited to join
                    the Cash Book as:
                </p>


                <div className="accept-member-name">
                    {invitation?.member_name}
                </div>


                <p>
                    Invitation sent to:
                </p>


                <div className="accept-email">

                    {invitation?.email
                        ? invitation.email
                        : invitation?.phone}

                </div>


                {error && (

                    <div className="accept-invitation-error">

                        {error}

                    </div>

                )}


                {checkingUser ? (

                    <div className="accept-checking-user">

                        Checking your account...

                    </div>

                ) : !loggedIn ? (

                    /*
                     * -------------------------------------------------
                     * USER NOT LOGGED IN
                     * -------------------------------------------------
                     */

                    <div className="accept-auth-section">

                        <p>
                            Please login or create an account
                            using the invited email or phone
                            number to continue.
                        </p>


                        <button
                            type="button"
                            className="accept-invitation-button"
                            onClick={handleLogin}
                        >
                            Login
                        </button>


                        <button
                            type="button"
                            className="accept-secondary-button"
                            onClick={handleSignup}
                        >
                            Create Account
                        </button>

                    </div>

                ) : !identityMatches ? (

                    /*
                     * -------------------------------------------------
                     * LOGGED IN BUT WRONG USER
                     * -------------------------------------------------
                     */

                    <div className="accept-mismatch-section">

                        <div className="accept-mismatch-icon">
                            !
                        </div>


                        <h3>
                            Account does not match
                        </h3>


                        <p>
                            You are currently logged in
                            with a different account.
                        </p>


                        {(currentUserEmail || currentUserPhone) && (

                            <p>
                                Current account:
                                <strong>
                                    {" "}
                                    {currentUserEmail || currentUserPhone}
                                </strong>
                            </p>

                        )}


                        <p>
                            Please sign out and login using
                            the invited account.
                        </p>


                        <button
                            type="button"
                            className="accept-invitation-button"
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </button>

                    </div>

                ) : (

                    /*
                     * -------------------------------------------------
                     * CORRECT USER
                     * -------------------------------------------------
                     */

                    <div className="accept-match-section">

                        <div className="accept-match-icon">
                            ✓
                        </div>


                        <p>
                            You are logged in with the
                            invited account.
                        </p>


                        <button
                            type="button"
                            className="accept-invitation-button"
                            onClick={handleAccept}
                            disabled={accepting}
                        >

                            {accepting
                                ? "Accepting..."
                                : "Accept Invitation"}

                        </button>

                    </div>

                )}

            </div>

        </section>

    );

}


export default AcceptInvitationPage;