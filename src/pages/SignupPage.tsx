import {
    useState,
} from "react";
import { appPath } from "../utils/appUrl";
import { supabase } from "../lib/supabase";

import "./../styles/SignupPage.css";

import Logo from "../components/common/Logo/Logo";
import Card from "../components/common/Card/Card";
import Button from "../components/common/Button/Button";
import Input from "../components/common/Input/Input";
import Alert from "../components/common/Alert/Alert";
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


    const passwordStrength =
        getPasswordStrength(
            password
        );


    const passwordsMatch =
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword;


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");


    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");


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
        setSuccessMessage("");


        const trimmedName =
            fullName.trim();


        const trimmedEmail =
            email.trim();


        const trimmedContactNo =
            contactNo.trim();


        /*
         * Full name
         */

        if (!trimmedName) {

            setErrorMessage(
                "Please enter your full name."
            );

            return;

        }


        /*
         * Contact number
         */

        if (!trimmedContactNo) {

            setErrorMessage(
                "Please enter your contact number."
            );

            return;

        }


        if (
            !/^[0-9]{10}$/.test(
                trimmedContactNo
            )
        ) {

            setErrorMessage(
                "Please enter a valid 10-digit contact number."
            );

            return;

        }


        /*
         * Email
         */

        if (!trimmedEmail) {

            setErrorMessage(
                "Please enter your email address."
            );

            return;

        }


        /*
         * Password
         */

        if (password.length < 6) {

            setErrorMessage(
                "Password must contain at least 6 characters."
            );

            return;

        }


        /*
         * Confirm password
         */

        if (
            password !==
            confirmPassword
        ) {

            setErrorMessage(
                "Passwords do not match."
            );

            return;

        }


        try {

            setLoading(true);


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


            if (error) {

                throw error;

            }


            /*
             * Session exists
             *
             * This happens when Supabase allows
             * immediate login after signup.
             */

            if (data.session) {

                setSuccessMessage(
                    "Account created successfully."
                );


                const invitationReturnUrl =
                    sessionStorage.getItem(
                        "invitation_return_url"
                    );


                if (invitationReturnUrl) {

                    sessionStorage.removeItem(
                        "invitation_return_url"
                    );

                    window.location.href =
                        appPath(invitationReturnUrl);

                    return;

                }


                onSignupSuccess?.();

            } else {

                setSuccessMessage(
                    "Account created. Please verify your email before logging in."
                );

            }

            setFullName("");
            setContactNo("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");


        } catch (error: unknown) {

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create account.";


            setErrorMessage(
                message
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <main className="signup-page">

            <div className="signup-container">


                <section className="signup-brand">

                    <Logo />

                    <p>
                        Manage your family's finances
                        securely from anywhere.
                    </p>

                </section>


                <section>

                    <Card className="signup-card">


                        <h2>
                            Create Account
                        </h2>


                        <p>
                            Join your family cash book.
                        </p>


                        {errorMessage && (

                            <Alert variant="error">
                                {errorMessage}
                            </Alert>

                        )}


                        {successMessage && (

                            <Alert variant="success">
                                {successMessage}
                            </Alert>

                        )}


                        <form
                            onSubmit={handleSignup}
                        >


                            <Input
                                label="Full Name"
                                value={fullName}
                                required={true}
                                disabled={loading}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                onChange={(event) =>
                                    setFullName(
                                        event.target.value
                                    )
                                }
                            />


                            <Input
                                label="Contact Number"
                                type="tel"
                                value={contactNo}
                                required={true}
                                disabled={loading}
                                placeholder="9876543210"
                                autoComplete="tel"
                                onChange={(event) =>
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


                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                required={true}
                                disabled={loading}
                                placeholder="name@example.com"
                                autoComplete="email"
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                            />


                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                required={true}
                                disabled={loading}
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                            />


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

                                    {passwordStrength}

                                </span>

                            </p>


                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                required={true}
                                disabled={loading}
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                            />


                            {confirmPassword.length > 0 && (

                                <p
                                    className={
                                        passwordsMatch
                                            ? "password-match success"
                                            : "password-match error"
                                    }
                                >

                                    {passwordsMatch
                                        ? "✓ Passwords match"
                                        : "✗ Passwords do not match"}

                                </p>

                            )}


                            <div className="signup-actions">

                                <Button
                                    type="submit"
                                    disabled={loading}
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


                        <div className="signup-footer">

                            <p>
                                Already have an account?
                            </p>


                            <Button
                                variant="secondary"
                                onClick={onShowLogin}
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