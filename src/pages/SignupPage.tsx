import {
    useState,
    //   type FormEvent,
} from "react";
import { supabase } from "../lib/supabase";

type SignupPageProps = {
    onShowLogin: () => void;
};

function SignupPage({
    onShowLogin,
}: SignupPageProps) {
    const [fullName, setFullName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [contactNo, setContactNo] =
        useState("");


    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    const handleSignup = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const trimmedName = fullName.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            setErrorMessage(
                "Please enter your full name."
            );
            return;
        }

        if (!trimmedEmail) {
            setErrorMessage(
                "Please enter your email address."
            );
            return;
        }

        const trimmedContactNo =
            contactNo.trim();

        if (!trimmedContactNo) {
            setErrorMessage(
                "Please enter your contact number."
            );
            return;
        }

        if (!/^[0-9]{10}$/.test(trimmedContactNo)) {
            setErrorMessage(
                "Please enter a valid 10-digit contact number."
            );
            return;
        }

        if (password.length < 6) {
            setErrorMessage(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
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
            } = await supabase.auth.signUp({
                email: trimmedEmail,
                password,
                options: {
                    data: {
                        full_name: trimmedName,
                        contact_no: trimmedContactNo,
                    },
                },
            });

            if (error) {
                throw error;
            }

            if (data.session) {
                setSuccessMessage(
                    "Your account was created successfully."
                );
            } else {
                setSuccessMessage(
                    "Your account was created. Please check your email and confirm your account before logging in."
                );
            }
            setContactNo("");
            setPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to create your account.";

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

                <h2>Create your account</h2>


                {errorMessage && (
                    <div
                        role="alert"
                        style={{
                            marginBottom: "16px",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #dc2626",
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        style={{
                            marginBottom: "16px",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #16a34a",
                        }}
                    >
                        {successMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSignup}
                >
                    <div
                        style={{
                            marginBottom: "16px",
                        }}
                    >
                        <label
                            htmlFor="fullName"
                        >
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(event) => {
                                setFullName(
                                    event.target.value
                                );
                            }}
                            placeholder="Enter your full name"
                            autoComplete="name"
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
                            marginBottom: "16px",
                        }}
                    >
                        <label
                            htmlFor="email"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
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
                            marginBottom: "16px",
                        }}
                    >
                        <label htmlFor="contactNo">
                            Contact Number
                        </label>

                        <input
                            id="contactNo"
                            type="tel"
                            value={contactNo}
                            onChange={(event) => {
                                const numbersOnly =
                                    event.target.value.replace(
                                        /\D/g,
                                        ""
                                    );

                                setContactNo(
                                    numbersOnly.slice(0, 10)
                                );
                            }}
                            placeholder="Enter 10-digit mobile number"
                            autoComplete="tel"
                            inputMode="numeric"
                            maxLength={10}
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
                            marginBottom: "16px",
                        }}
                    >
                        <label
                            htmlFor="password"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(
                                    event.target.value
                                );
                            }}
                            placeholder="Minimum 6 characters"
                            autoComplete="new-password"
                            disabled={loading}
                            required
                            minLength={6}
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
                        <label
                            htmlFor="confirmPassword"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => {
                                setConfirmPassword(
                                    event.target.value
                                );
                            }}
                            placeholder="Enter the password again"
                            autoComplete="new-password"
                            disabled={loading}
                            required
                            minLength={6}
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
                            ? "Creating account..."
                            : "Create Account"}
                    </button>
                </form>

                <p
                    style={{
                        marginTop: "20px",
                    }}
                >
                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={onShowLogin}
                        disabled={loading}
                    >
                        Login
                    </button>
                </p>
            </section>
        </main>
    );
}

export default SignupPage;