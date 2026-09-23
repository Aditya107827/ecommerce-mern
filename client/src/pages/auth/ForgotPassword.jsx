import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password",
                { email: email.trim() }
            );

            setMessage(response.data.message);
            setEmail("");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to process your request."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-[70vh] items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-8 text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        Account Recovery
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                        Forgot your password?
                    </h1>

                    <p className="mt-3 text-sm text-gray-500">
                        Enter your email and we'll send you a password reset link.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* Success */}
                {message && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                    >
                        {message}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-gray-900 hover:underline"
                    >
                        Back to Login
                    </Link>
                </p>
            </div>
        </section>
    );
}

export default ForgotPassword;