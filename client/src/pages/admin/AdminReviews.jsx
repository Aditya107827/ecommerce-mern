import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/reviews/admin/all");

            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error(
                "Failed to fetch admin reviews:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load reviews"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleStatusChange = async (reviewId, status) => {
        try {
            setUpdatingId(reviewId);
            setError("");

            const response = await api.put(
                `/reviews/admin/${reviewId}/status`,
                { status }
            );

            const updatedReview = response.data.review;

            setReviews((currentReviews) =>
                currentReviews.map((review) =>
                    review._id === reviewId
                        ? updatedReview
                        : review
                )
            );
        } catch (error) {
            console.error(
                "Failed to update review status:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to update review status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusClasses = (status) => {
        return status === "published"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700";
    };

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    if (loading) {
        return (
            <section className="flex min-h-[50vh] items-center justify-center">
                <p className="text-gray-500">
                    Loading reviews...
                </p>
            </section>
        );
    }

    return (
        <section className="space-y-8">
            {/* Header */}
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Admin Panel
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                    Reviews
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage customer reviews and their visibility.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Review Count */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-500">
                    Total Reviews
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                    {reviews.length}
                </p>
            </div>

            {/* Reviews */}
            {reviews.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        No Reviews Found
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Customer reviews will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {reviews.map((review) => (
                        <article
                            key={review._id}
                            className="rounded-2xl border border-gray-200 bg-white p-6"
                        >
                            {/* Top */}
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Product
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-900">
                                        {review.product?.name ||
                                            "Unknown Product"}
                                    </p>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {new Date(
                                            review.createdAt
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                            review.status
                                        )}`}
                                    >
                                        {review.status}
                                    </span>

                                    <select
                                        value={review.status}
                                        disabled={
                                            updatingId ===
                                            review._id
                                        }
                                        onChange={(event) =>
                                            handleStatusChange(
                                                review._id,
                                                event.target.value
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="published">
                                            Published
                                        </option>

                                        <option value="hidden">
                                            Hidden
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="my-6 border-t border-gray-100" />

                            {/* Customer */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Customer
                                    </p>

                                    <p className="mt-1 font-semibold text-gray-900">
                                        {review.user?.name ||
                                            review.userName ||
                                            "Unknown"}
                                    </p>

                                    {review.verifiedPurchase && (
                                        <p className="mt-1 text-sm font-medium text-green-600">
                                            Verified Purchase
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Rating
                                    </p>

                                    <p className="mt-1 text-lg tracking-wide text-gray-900">
                                        {renderStars(
                                            review.rating
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="my-6 border-t border-gray-100" />

                            {/* Comment */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Review
                                </h2>

                                <p className="mt-3 rounded-lg bg-gray-50 p-4 leading-6 text-gray-700">
                                    {review.comment}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default AdminReviews;