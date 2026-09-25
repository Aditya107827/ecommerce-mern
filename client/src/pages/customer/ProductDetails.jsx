import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { addProductToCart } from "../../store/cartSlice";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
    addProductToWishlist,
    removeProductFromWishlist,
} from "../../store/wishlistSlice";

import { getProductById } from "../../services/productService";

function ProductDetails() {
    const { productId } = useParams();

    const dispatch = useDispatch();
    const { user } = useAuth();
    const navigate = useNavigate();

    const wishlistItems = useSelector(
        (state) => state.wishlist.items
    );

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({
        averageRating: 0,
        totalReviews: 0,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0,
    });
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSubmitError, setReviewSubmitError] = useState("");
    const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState("");
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editReviewRating, setEditReviewRating] = useState(0);
    const [reviewEligibility, setReviewEligibility] = useState({
        canReview: false,
        hasReviewed: false,
        verifiedPurchase: false,
    });
    const [reviewEligibilityLoading, setReviewEligibilityLoading] =
        useState(false);

    // Fetch product from backend
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProductById(productId);

                setProduct({
                    ...data,
                    id: data._id,
                });
            } catch (error) {
                console.error("Failed to fetch product:", error);

                setError("Unable to load product.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);




    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setReviewsLoading(true);
                setReviewsError("");

                const [reviewsResponse, summaryResponse] =
                    await Promise.all([
                        api.get(`/reviews/product/${productId}`),
                        api.get(`/reviews/product/${productId}/summary`),
                    ]);

                setReviews(reviewsResponse.data.reviews || []);

                setReviewSummary(
                    summaryResponse.data.summary || {
                        averageRating: 0,
                        totalReviews: 0,
                        rating5: 0,
                        rating4: 0,
                        rating3: 0,
                        rating2: 0,
                        rating1: 0,
                    }
                );
            } catch (error) {
                console.error("Failed to fetch reviews:", error);

                setReviewsError(
                    "Unable to load reviews."
                );
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    const handleReviewUpdate = async (reviewId) => {
        setReviewSubmitError("");
        setReviewSubmitSuccess("");

        if (editReviewRating < 1 || editReviewRating > 5) {
            setReviewSubmitError(
                "Please select a rating between 1 and 5."
            );
            return;
        }

        const trimmedComment = reviewComment.trim();

        if (trimmedComment.length < 3) {
            setReviewSubmitError(
                "Review comment must be at least 3 characters."
            );
            return;
        }

        if (trimmedComment.length > 1000) {
            setReviewSubmitError(
                "Review comment cannot exceed 1000 characters."
            );
            return;
        }

        try {
            const response = await api.put(
                `/reviews/${reviewId}`,
                {
                    rating: editReviewRating,
                    comment: trimmedComment,
                }
            );

            setReviews((currentReviews) =>
                currentReviews.map((review) =>
                    review._id === reviewId
                        ? response.data.review
                        : review
                )
            );

            const summaryResponse = await api.get(
                `/reviews/product/${productId}/summary`
            );

            setReviewSummary(summaryResponse.data.summary);

            setEditingReviewId(null);
            setEditReviewRating(0);
            setReviewComment("");

            setReviewSubmitSuccess(
                "Your review has been updated successfully."
            );
        } catch (error) {
            console.error("Failed to update review:", error);

            setReviewSubmitError(
                error.response?.data?.message ||
                "Unable to update your review."
            );
        }
    };


    const handleReviewDelete = async (reviewId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your review?"
        );

        if (!confirmed) {
            return;
        }

        setReviewSubmitError("");
        setReviewSubmitSuccess("");

        try {
            await api.delete(`/reviews/${reviewId}`);

            setReviews((currentReviews) =>
                currentReviews.filter(
                    (review) => review._id !== reviewId
                )
            );

            const summaryResponse = await api.get(
                `/reviews/product/${productId}/summary`
            );

            setReviewSummary(summaryResponse.data.summary);

            setReviewEligibility({
                canReview: true,
                hasReviewed: false,
                verifiedPurchase: true,
            });

            setReviewSubmitSuccess(
                "Your review has been deleted successfully."
            );
        } catch (error) {
            console.error(
                "Failed to delete review:",
                error
            );

            setReviewSubmitError(
                error.response?.data?.message ||
                "Unable to delete your review."
            );
        }
    };

    const handleReviewSubmit = async (event) => {
        event.preventDefault();

        setReviewSubmitError("");
        setReviewSubmitSuccess("");

        if (reviewRating < 1 || reviewRating > 5) {
            setReviewSubmitError(
                "Please select a rating between 1 and 5."
            );
            return;
        }

        const trimmedComment = reviewComment.trim();

        if (trimmedComment.length < 3) {
            setReviewSubmitError(
                "Review comment must be at least 3 characters."
            );
            return;
        }

        if (trimmedComment.length > 1000) {
            setReviewSubmitError(
                "Review comment cannot exceed 1000 characters."
            );
            return;
        }

        try {
            setReviewSubmitting(true);

            const response = await api.post(
                `/reviews/product/${productId}`,
                {
                    rating: reviewRating,
                    comment: trimmedComment,
                }
            );

            setReviews((currentReviews) => [
                response.data.review,
                ...currentReviews,
            ]);

            const summaryResponse = await api.get(
                `/reviews/product/${productId}/summary`
            );

            setReviewSummary(summaryResponse.data.summary);

            setReviewRating(0);
            setReviewComment("");
            setReviewSubmitSuccess(
                "Your review has been added successfully."
            );
        } catch (error) {
            console.error("Failed to submit review:", error);

            setReviewSubmitError(
                error.response?.data?.message ||
                "Unable to submit your review."
            );
        } finally {
            setReviewSubmitting(false);
        }
    };

    useEffect(() => {
        const checkReviewEligibility = async () => {
            if (!user) {
                setReviewEligibility({
                    canReview: false,
                    hasReviewed: false,
                    verifiedPurchase: false,
                });
                return;
            }

            try {
                setReviewEligibilityLoading(true);

                const response = await api.get(
                    `/reviews/product/${productId}/eligibility`
                );

                setReviewEligibility(
                    response.data || {
                        canReview: false,
                        hasReviewed: false,
                        verifiedPurchase: false,
                    }
                );
            } catch (error) {
                console.error(
                    "Failed to check review eligibility:",
                    error
                );

                setReviewEligibility({
                    canReview: false,
                    hasReviewed: false,
                    verifiedPurchase: false,
                });
            } finally {
                setReviewEligibilityLoading(false);
            }
        };

        checkReviewEligibility();
    }, [productId, user]);

    // Loading
    if (loading) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <p className="text-gray-500">
                    Loading product...
                </p>
            </section>
        );
    }

    // Error / Product not found
    if (error || !product) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6">
                <div className="text-center">

                    <h1 className="text-2xl font-bold text-gray-900">
                        Product not found
                    </h1>

                    <p className="mt-2 text-gray-500">
                        {error ||
                            "The product you're looking for doesn't exist."}
                    </p>

                    <Link
                        to="/products"
                        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white"
                    >
                        Back to Products
                    </Link>

                </div>
            </section>
        );
    }

    const galleryImages =
        product.images?.length > 0
            ? product.images
            : product.image
                ? [{ url: product.image, publicId: "" }]
                : [];

    const isWishlisted = wishlistItems.some(
        (item) => item.id === product.id
    );

    const currentUserId = user?._id || user?.id;

    const userReview = currentUserId
        ? reviews.find((review) => {
            const reviewUserId =
                review.user?._id ||
                review.user?.id ||
                review.user;

            return String(reviewUserId) === String(currentUserId);
        })
        : null;

    return (
        <section className="py-12">
            <div className="mx-auto max-w-7xl px-6">

                <div className="grid gap-10 lg:grid-cols-2">

                    {/* Product Images */}
                    <div>
                        {/* Main Image */}
                        <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-gray-100 sm:min-h-[500px]">
                            {galleryImages.length > 0 ? (
                                <img
                                    src={galleryImages[selectedImage]?.url}
                                    alt={product.name}
                                    className="max-h-[500px] max-w-full object-contain"
                                />
                            ) : (
                                <span className="text-sm text-gray-400">
                                    Product Image
                                </span>
                            )}
                        </div>

                        {/* Image Thumbnails */}
                        {galleryImages.length > 1 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto">
                                {galleryImages.map((image, index) => (
                                    <button
                                        key={image.publicId || index}
                                        type="button"
                                        onClick={() => setSelectedImage(index)}
                                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === index
                                            ? "border-black"
                                            : "border-gray-200"
                                            }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Information */}
                    <div className="flex flex-col justify-center">

                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                            {product.category
                                ?.replace(/-/g, " ")
                                .toUpperCase()}
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                            {product.name}
                        </h1>

                        <p className="mt-5 text-2xl font-bold text-gray-900">
                            ₹{product.price.toLocaleString("en-IN")}
                        </p>

                        <p className="mt-6 leading-7 text-gray-600">
                            {product.description ||
                                "Beautifully crafted product designed to add a special touch to your space and memories."}
                        </p>

                        {/* Stock */}
                        <p className="mt-4 text-sm font-medium text-gray-600">
                            {product.stock > 0
                                ? `${product.stock} items available`
                                : "Out of stock"}
                        </p>

                        {/* Quantity */}
                        {product.stock > 0 && (
                            <div className="mt-8">

                                <p className="mb-3 text-sm font-semibold text-gray-900">
                                    Quantity
                                </p>

                                <div className="flex w-fit items-center rounded-lg border border-gray-300">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((current) =>
                                                Math.max(1, current - 1)
                                            )
                                        }
                                        className="flex h-11 w-11 items-center justify-center text-lg hover:bg-gray-100"
                                    >
                                        −
                                    </button>

                                    <span className="flex h-11 w-12 items-center justify-center border-x border-gray-300 font-semibold">
                                        {quantity}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={quantity >= product.stock}
                                        onClick={() =>
                                            setQuantity((current) =>
                                                Math.min(
                                                    product.stock,
                                                    current + 1
                                                )
                                            )
                                        }
                                        className="flex h-11 w-11 items-center justify-center text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        +
                                    </button>

                                </div>

                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <button
                                type="button"
                                disabled={product.stock <= 0}
                                onClick={() => {
                                    if (!user) {
                                        toast.error("Please login to add products to your cart.");
                                        navigate("/login", {
                                            state: {
                                                from: {
                                                    pathname: `/products/${product.id}`,
                                                },
                                            },
                                        });
                                        return;
                                    }

                                    dispatch(
                                        addProductToCart({
                                            productId: product.id,
                                            quantity: quantity,
                                        })
                                    );
                                }}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                <ShoppingCart size={18} />
                                {product.stock > 0
                                    ? "Add to Cart"
                                    : "Out of Stock"}
                            </button>

                            <button
                                type="button"
                                aria-label={
                                    isWishlisted
                                        ? "Remove from wishlist"
                                        : "Add to wishlist"
                                }
                                onClick={() => {
                                    if (!user) {
                                        toast.error("Please login to manage your wishlist.");
                                        navigate("/login", {
                                            state: {
                                                from: {
                                                    pathname: `/products/${product.id}`,
                                                },
                                            },
                                        });
                                        return;
                                    }

                                    if (isWishlisted) {
                                        dispatch(
                                            removeProductFromWishlist(product.id)
                                        );
                                    } else {
                                        dispatch(
                                            addProductToWishlist(product.id)
                                        );
                                    }
                                }}
                                className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 transition hover:bg-gray-100"
                            >
                                <Heart
                                    size={22}
                                    fill={
                                        isWishlisted
                                            ? "currentColor"
                                            : "none"
                                    }
                                />
                            </button>

                        </div>

                    </div>



                </div>


                {/* Reviews & Rating Summary */}
                <div className="mt-16 border-t border-gray-200 pt-12">
                    <div className="grid gap-10 md:grid-cols-2">
                        {/* Rating Overview */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Customer Reviews
                            </h2>

                            {reviewsLoading ? (
                                <p className="mt-4 text-sm text-gray-500">
                                    Loading reviews...
                                </p>
                            ) : reviewsError ? (
                                <p className="mt-4 text-sm text-red-500">
                                    {reviewsError}
                                </p>
                            ) : (
                                <>
                                    <div className="mt-6 flex items-center gap-4">
                                        <span className="text-5xl font-bold text-gray-900">
                                            {reviewSummary.averageRating.toFixed(1)}
                                        </span>

                                        <div>
                                            <div className="text-xl tracking-wide">
                                                {"★".repeat(
                                                    Math.round(
                                                        reviewSummary.averageRating
                                                    )
                                                )}
                                                <span className="text-gray-300">
                                                    {"★".repeat(
                                                        5 -
                                                        Math.round(
                                                            reviewSummary.averageRating
                                                        )
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {reviewSummary.totalReviews}{" "}
                                                {reviewSummary.totalReviews === 1
                                                    ? "review"
                                                    : "reviews"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rating Distribution */}
                                    <div className="mt-8 space-y-3">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const count =
                                                reviewSummary[
                                                `rating${rating}`
                                                ];

                                            const percentage =
                                                reviewSummary.totalReviews > 0
                                                    ? (count /
                                                        reviewSummary.totalReviews) *
                                                    100
                                                    : 0;

                                            return (
                                                <div
                                                    key={rating}
                                                    className="flex items-center gap-3 text-sm"
                                                >
                                                    <span className="w-10">
                                                        {rating} ★
                                                    </span>

                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                                        <div
                                                            className="h-full rounded-full bg-black"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="w-8 text-right text-gray-500">
                                                        {count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Review Count / Empty State */}
                        <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-8">
                            {reviewsLoading ? (
                                <p className="text-sm text-gray-500">
                                    Loading...
                                </p>
                            ) : reviews.length === 0 ? (
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900">
                                        No reviews yet
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Be the first customer to review this
                                        product.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-gray-900">
                                        {reviewSummary.totalReviews}
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Customer{" "}
                                        {reviewSummary.totalReviews === 1
                                            ? "review"
                                            : "reviews"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Write a Review */}
                {/* Write a Review */}
                <div className="mt-12 border-t border-gray-200 pt-10">
                    {!user ? (
                        <div className="rounded-2xl bg-gray-50 p-8 text-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                Want to review this product?
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Please login to share your experience.
                            </p>

                            <Link
                                to="/login"
                                state={{ from: `/products/${productId}` }}
                                className="mt-5 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Login to Review
                            </Link>
                        </div>
                    ) : reviewEligibilityLoading ? (
                        <div className="rounded-2xl bg-gray-50 p-8 text-center">
                            <p className="text-sm text-gray-500">
                                Checking review eligibility...
                            </p>
                        </div>
                    ) : reviewEligibility.hasReviewed || userReview ? (
                        <div className="rounded-2xl bg-gray-50 p-8">
                            <h3 className="text-xl font-bold text-gray-900">
                                You have already reviewed this product
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Thank you for sharing your experience with other
                                customers.
                            </p>
                        </div>
                    ) : !reviewEligibility.canReview ? (
                        <div className="rounded-2xl bg-gray-50 p-8">
                            <h3 className="text-xl font-bold text-gray-900">
                                Review this product
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                You can write a review after purchasing this product.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-2xl">
                            <h3 className="text-xl font-bold text-gray-900">
                                Write a Review
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                Share your experience with this product.
                            </p>

                            <form
                                onSubmit={handleReviewSubmit}
                                className="mt-6 space-y-6"
                            >
                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900">
                                        Your Rating
                                    </label>

                                    <div
                                        className="mt-3 flex gap-2"
                                        role="radiogroup"
                                        aria-label="Product rating"
                                    >
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                role="radio"
                                                aria-checked={
                                                    reviewRating === rating
                                                }
                                                aria-label={`${rating} star${rating > 1 ? "s" : ""
                                                    }`}
                                                onClick={() =>
                                                    setReviewRating(rating)
                                                }
                                                className={`text-3xl transition ${rating <= reviewRating
                                                    ? "text-black"
                                                    : "text-gray-300"
                                                    } hover:scale-105`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label
                                        htmlFor="review-comment"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        Your Review
                                    </label>

                                    <textarea
                                        id="review-comment"
                                        value={reviewComment}
                                        onChange={(event) =>
                                            setReviewComment(event.target.value)
                                        }
                                        rows={5}
                                        maxLength={1000}
                                        placeholder="Tell us about your experience..."
                                        className="mt-3 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                                    />

                                    <p className="mt-2 text-right text-xs text-gray-500">
                                        {reviewComment.length}/1000
                                    </p>
                                </div>

                                {/* Error */}
                                {reviewSubmitError && (
                                    <div
                                        role="alert"
                                        className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
                                    >
                                        {reviewSubmitError}
                                    </div>
                                )}

                                {/* Success */}
                                {reviewSubmitSuccess && (
                                    <div
                                        role="status"
                                        className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700"
                                    >
                                        {reviewSubmitSuccess}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={reviewSubmitting}
                                    className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                                >
                                    {reviewSubmitting
                                        ? "Submitting..."
                                        : "Submit Review"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Customer Reviews List */}
                <div className="mt-12 border-t border-gray-200 pt-10">
                    <h3 className="text-xl font-bold text-gray-900">
                        What our customers say
                    </h3>

                    {reviewsLoading ? (
                        <div className="mt-6 space-y-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="animate-pulse rounded-2xl border border-gray-200 p-6"
                                >
                                    <div className="h-4 w-32 rounded bg-gray-200" />
                                    <div className="mt-3 h-3 w-24 rounded bg-gray-200" />
                                    <div className="mt-4 h-3 w-full rounded bg-gray-200" />
                                    <div className="mt-2 h-3 w-4/5 rounded bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    ) : reviewsError ? (
                        <p className="mt-6 text-sm text-red-500">
                            {reviewsError}
                        </p>
                    ) : reviews.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                            <p className="font-semibold text-gray-900">
                                No customer reviews yet
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Reviews from verified customers will appear
                                here.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {reviews.map((review) => (
                                <article
                                    key={review._id}
                                    className="rounded-2xl border border-gray-200 bg-white p-6"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-semibold text-gray-900">
                                                    {review.userName ||
                                                        review.user?.name ||
                                                        "Customer"}
                                                </h4>

                                                {review.verifiedPurchase && (
                                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 text-sm tracking-wide">
                                                {"★".repeat(review.rating)}
                                                <span className="text-gray-300">
                                                    {"★".repeat(
                                                        5 - review.rating
                                                    )}
                                                </span>
                                            </div>

                                            {userReview && userReview._id === review._id && (
                                                <div className="mt-3 flex gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingReviewId(review._id);
                                                            setEditReviewRating(review.rating);
                                                            setReviewComment(review.comment);
                                                            setReviewSubmitError("");
                                                            setReviewSubmitSuccess("");
                                                        }}
                                                        className="text-sm font-semibold text-gray-700 hover:text-black hover:underline"
                                                    >
                                                        Edit Review
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleReviewDelete(review._id)
                                                        }
                                                        className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                                                    >
                                                        Delete Review
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <time
                                            dateTime={review.createdAt}
                                            className="text-sm text-gray-500"
                                        >
                                            {new Date(
                                                review.createdAt
                                            ).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </time>
                                    </div>

                                    {editingReviewId === review._id ? (
                                        <div className="mt-5 space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900">
                                                    Your Rating
                                                </label>

                                                <div className="mt-3 flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <button
                                                            key={rating}
                                                            type="button"
                                                            onClick={() =>
                                                                setEditReviewRating(rating)
                                                            }
                                                            className={`text-2xl transition ${rating <= editReviewRating
                                                                ? "text-black"
                                                                : "text-gray-300"
                                                                } hover:scale-105`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor={`edit-review-${review._id}`}
                                                    className="block text-sm font-semibold text-gray-900"
                                                >
                                                    Your Review
                                                </label>

                                                <textarea
                                                    id={`edit-review-${review._id}`}
                                                    value={reviewComment}
                                                    onChange={(event) =>
                                                        setReviewComment(event.target.value)
                                                    }
                                                    rows={4}
                                                    maxLength={1000}
                                                    className="mt-3 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                                                />

                                                <p className="mt-2 text-right text-xs text-gray-500">
                                                    {reviewComment.length}/1000
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingReviewId(null);
                                                        setEditReviewRating(0);
                                                        setReviewComment("");
                                                    }}
                                                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleReviewUpdate(review._id)}
                                                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 leading-7 text-gray-600">
                                            {review.comment}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}

export default ProductDetails;