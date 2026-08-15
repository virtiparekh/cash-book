import {
    useState,
} from "react";

import { appPath } from "../utils/appUrl";
import { supabase } from "../lib/supabase";

import "./../styles/SignupPage.css";

import Popup from "../components/common/Popup/Popup";
import Logo from "../components/common/Logo/Logo";
import Card from "../components/common/Card/Card";
import Button from "../components/common/Button/Button";
import Input from "../components/common/Input/Input";
import Loader from "../components/common/Loader/Loader";

import {
    getPasswordStrength,
} from "../utils/passwordUtils";


type SignupPageProps = {
    onShowLogin: () => void;
    onSignupSuccess?: () => void;
};


function SignupPage({
    onShowLogin,
    onSignupSuccess,
}: SignupPageProps) {

    const [
        fullName,
        setFullName,
    ] = useState("");


    const [
        contactNo,
        setContactNo,
    ] = useState("");


    const [
        email,
        setEmail,
    ] = useState("");


    const [
        password,
        setPassword,
    ] = useState("");


    const [
        confirmPassword,
        setConfirmPassword,
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
     * Password strength
     * -------------------------------------------------
     */

    const passwordStrength =
        getPasswordStrength(
            password
        );


    /*
     * -------------------------------------------------
     * Password match
     * -------------------------------------------------
     */

    const passwordsMatch =
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword;


    /*
     * -------------------------------------------------
     * Show error popup
     * -------------------------------------------------
     */

    const showError = (
        message: string
    ): void => {

        setErrorMessage(
            message
        );

        setShowPopup(
            true
        );

    };


    /*
     * -------------------------------------------------
     * Close popup
     * -------------------------------------------------
     */

    const closePopup = (): void => {

        setShowPopup(
            false
        );

        setErrorMessage(
            ""
        );

    };


    /*
     * -------------------------------------------------
     * Signup
     * -------------------------------------------------
     */

    const handleSignup = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {

        event.preventDefault();


        setErrorMessage("");


        const trimmedName =
            fullName.trim();


        const trimmedEmail =
            email.trim();


        const trimmedContactNo =
            contactNo.trim();


        /*
         * -------------------------------------------------
         * Full name
         * -------------------------------------------------
         */

        if (!trimmedName) {

            showError(
                "Please enter your full name."
            );

            return;

        }


        /*
         * -------------------------------------------------
         * Contact number
         * -------------------------------------------------
         */

        if (!trimmedContactNo) {

            showError(
                "Please enter your contact number."
            );

            return;

        }


        if (
            !/^[0-9]{10}$/.test(
                trimmedContactNo
            )
        ) {

            showError(
                "Please enter a valid 10-digit contact number."
            );

            return;

        }


        /*
         * -------------------------------------------------
         * Email
         * -------------------------------------------------
         */

        if (!trimmedEmail) {

            showError(
                "Please enter your email address."
            );

            return;

        }


        /*
         * -------------------------------------------------
         * Password
         * -------------------------------------------------
         */

        if (
            password.length < 6
        ) {

            showError(
                "Password must contain at least 6 characters."
            );

            return;

        }


        /*
         * -------------------------------------------------
         * Confirm password
         * -------------------------------------------------
         */

        if (
            password !==
            confirmPassword
        ) {

            showError(
                "Passwords do not match."
            );

            return;

        }


        /*
         * -------------------------------------------------
         * Create account
         * -------------------------------------------------
         */

        try {

            setLoading(
                true
            );


            const {
                data,
                error,
            } =
                await supabase.auth.signUp({

                    email:
                        trimmedEmail,

                    password,

                    options: {

                        data: {

                            full_name:
                                trimmedName,

                            contact_no:
                                trimmedContactNo,

                        },

                    },

                });


            /*
             * -------------------------------------------------
             * Supabase error
             * -------------------------------------------------
             */

            if (error) {

                throw error;

            }


            /*
             * -------------------------------------------------
             * Session exists
             *
             * Supabase allows immediate login.
             * -------------------------------------------------
             */

            if (
                data.session
            ) {

                /*
                 * -------------------------------------------------
                 * Invitation flow
                 *
                 * invitation_return_url already contains
                 * /cash-book/... because it was created using
                 * appPath() in AcceptInvitationPage.
                 * -------------------------------------------------
                 */

                const invitationReturnUrl =
                    sessionStorage.getItem(
                        "invitation_return_url"
                    );


                if (
                    invitationReturnUrl
                ) {

                    sessionStorage.removeItem(
                        "invitation_return_url"
                    );


                    window.location.href =
                        appPath(invitationReturnUrl);


                    return;

                }


                /*
                 * -------------------------------------------------
                 * Normal signup
                 * -------------------------------------------------
                 */

                setFullName("");
                setContactNo("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");


                onSignupSuccess?.();


                return;

            }


            /*
             * -------------------------------------------------
             * Email verification required
             * -------------------------------------------------
             *
             * No session means Supabase requires the user
             * to verify their email before login.
             * -------------------------------------------------
             */

            setFullName("");
            setContactNo("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");


            showError(
                "Account created successfully. Please verify your email before logging in."
            );


        } catch (
            error: unknown
        ) {

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create account.";


            showError(
                message
            );


        } finally {

            setLoading(
                false
            );

        }

    };


    /*
     * -------------------------------------------------
     * Render
     * -------------------------------------------------
     */

    return (

        <main className="signup-page">

            {/* 
             * -------------------------------------------------
             * Popup
             * -------------------------------------------------
             */}

            {showPopup && (

                <Popup
                    variant="error"
                    title="Signup"
                    onClose={
                        closePopup
                    }
                >

                    {errorMessage}

                </Popup>

            )}


            <div className="signup-container">


                {/* 
                 * -------------------------------------------------
                 * Brand section
                 * -------------------------------------------------
                 */}

                <section className="signup-brand">

                    <Logo />

                    <p>
                        Manage your family's finances
                        securely from anywhere.
                    </p>

                </section>


                {/* 
                 * -------------------------------------------------
                 * Signup section
                 * -------------------------------------------------
                 */}

                <section>

                    <Card className="signup-card">


                        <h2>
                            Create Account
                        </h2>


                        <p>
                            Join your family cash book.
                        </p>


                        <form
                            onSubmit={
                                handleSignup
                            }
                        >


                            {/* 
                             * Full Name
                             */}

                            <Input
                                label="Full Name"
                                value={
                                    fullName
                                }
                                required={
                                    true
                                }
                                disabled={
                                    loading
                                }
                                placeholder="Enter your full name"
                                autoComplete="name"
                                onChange={
                                    (event) =>
                                        setFullName(
                                            event.target.value
                                        )
                                }
                            />


                            {/* 
                             * Contact Number
                             */}

                            <Input
                                label="Contact Number"
                                type="tel"
                                value={
                                    contactNo
                                }
                                required={
                                    true
                                }
                                disabled={
                                    loading
                                }
                                placeholder="9876543210"
                                autoComplete="tel"
                                onChange={
                                    (event) =>
                                        setContactNo(
                                            event.target.value
                                                .replace(
                                                    /\D/g,
                                                    ""
                                                )
                                                .slice(
                                                    0,
                                                    10
                                                )
                                        )
                                }
                            />


                            {/* 
                             * Email
                             */}

                            <Input
                                label="Email Address"
                                type="email"
                                value={
                                    email
                                }
                                required={
                                    true
                                }
                                disabled={
                                    loading
                                }
                                placeholder="name@example.com"
                                autoComplete="email"
                                onChange={
                                    (event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                }
                            />


                            {/* 
                             * Password
                             */}

                            <Input
                                label="Password"
                                type="password"
                                value={
                                    password
                                }
                                required={
                                    true
                                }
                                disabled={
                                    loading
                                }
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                onChange={
                                    (event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                }
                            />


                            {/* 
                             * Password strength
                             */}

                            <p className="password-strength">

                                Password Strength :

                                <span>

                                    {passwordStrength === "Weak" &&
                                        "🔴"}

                                    {passwordStrength === "Medium" &&
                                        "🟡"}

                                    {passwordStrength === "Strong" &&
                                        "🟢"}

                                    {" "}

                                    {
                                        passwordStrength
                                    }

                                </span>

                            </p>


                            {/* 
                             * Confirm Password
                             */}

                            <Input
                                label="Confirm Password"
                                type="password"
                                value={
                                    confirmPassword
                                }
                                required={
                                    true
                                }
                                disabled={
                                    loading
                                }
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                onChange={
                                    (event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                }
                            />


                            {/* 
                             * Password match
                             */}

                            {confirmPassword.length > 0 && (

                                <p
                                    className={
                                        passwordsMatch
                                            ? "password-match success"
                                            : "password-match error"
                                    }
                                >

                                    {
                                        passwordsMatch
                                            ? "✓ Passwords match"
                                            : "✗ Passwords do not match"
                                    }

                                </p>

                            )}


                            {/* 
                             * Signup button
                             */}

                            <div className="signup-actions">

                                <Button
                                    type="submit"
                                    disabled={
                                        loading
                                    }
                                >

                                    {loading ? (

                                        <Loader
                                            text="Creating Account..."
                                        />

                                    ) : (

                                        "Create Account"

                                    )}

                                </Button>

                            </div>


                        </form>


                        {/* 
                         * -------------------------------------------------
                         * Footer
                         * -------------------------------------------------
                         */}

                        <div className="signup-footer">

                            <p>
                                Already have an account?
                            </p>


                            <Button
                                variant="secondary"
                                onClick={
                                    onShowLogin
                                }
                            >
                                Login
                            </Button>


                            <div className="signup-bottom-text">
                                © 2026 Family Cash Book
                            </div>

                        </div>


                    </Card>

                </section>


            </div>

        </main>

    );

}


export default SignupPage;