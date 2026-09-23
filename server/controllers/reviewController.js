const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
// Get published reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({
            product: productId,
            status: "published",
        })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            reviews,
        });
    } catch (error) {
        console.error("Get product reviews error:", error);

        return res.status(500).json({
            message: "Unable to fetch reviews",
        });
    }
};

// Check whether the logged-in user can review a product
const getReviewEligibility = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const existingReview = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        if (existingReview) {
            return res.status(200).json({
                canReview: false,
                hasReviewed: true,
                verifiedPurchase: true,
            });
        }

        const previousOrder = await Order.findOne({
            user: req.user._id,
            "items.product": productId,
            orderStatus: {
                $in: [
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                ],
            },
        });

        return res.status(200).json({
            canReview: !!previousOrder,
            hasReviewed: false,
            verifiedPurchase: !!previousOrder,
        });
    } catch (error) {
        console.error(
            "Get review eligibility error:",
            error
        );

        return res.status(500).json({
            message: "Unable to check review eligibility",
        });
    }
};

// Add a review
const addReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        // Validate product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // Validate rating
        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be a whole number between 1 and 5",
            });
        }

        // Validate comment
        if (
            typeof comment !== "string" ||
            comment.trim().length < 3
        ) {
            return res.status(400).json({
                message: "Review comment must be at least 3 characters",
            });
        }

        if (comment.trim().length > 1000) {
            return res.status(400).json({
                message: "Review comment cannot exceed 1000 characters",
            });
        }

        // Check if user has purchased this product
        const previousOrder = await Order.findOne({
            user: req.user._id,
            "items.product": productId,
            orderStatus: {
                $in: ["confirmed", "processing", "shipped", "delivered"],
            },
        });

        if (!previousOrder) {
            return res.status(403).json({
                message:
                    "You can review this product only after purchasing it",
            });
        }

        // Check for an existing review
        const existingReview = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You have already reviewed this product",
            });
        }

        // Create review
        const review = await Review.create({
            product: productId,
            user: req.user._id,
            userName: req.user.name,
            rating,
            comment: comment.trim(),
            verifiedPurchase: true,
            status: "published",
        });

        return res.status(201).json({
            message: "Review added successfully",
            review,
        });
    } catch (error) {
        // Handles unique index race condition
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already reviewed this product",
            });
        }

        console.error("Add review error:", error);

        return res.status(500).json({
            message: "Unable to add review",
        });
    }
};



const getProductRatingSummary = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId).select("_id");

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const summary = await Review.aggregate([
            {
                $match: {
                    product: product._id,
                    status: "published",
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    rating5: {
                        $sum: {
                            $cond: [{ $eq: ["$rating", 5] }, 1, 0],
                        },
                    },
                    rating4: {
                        $sum: {
                            $cond: [{ $eq: ["$rating", 4] }, 1, 0],
                        },
                    },
                    rating3: {
                        $sum: {
                            $cond: [{ $eq: ["$rating", 3] }, 1, 0],
                        },
                    },
                    rating2: {
                        $sum: {
                            $cond: [{ $eq: ["$rating", 2] }, 1, 0],
                        },
                    },
                    rating1: {
                        $sum: {
                            $cond: [{ $eq: ["$rating", 1] }, 1, 0],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    averageRating: {
                        $round: ["$averageRating", 1],
                    },
                    totalReviews: 1,
                    rating5: 1,
                    rating4: 1,
                    rating3: 1,
                    rating2: 1,
                    rating1: 1,
                },
            },
        ]);

        return res.status(200).json({
            summary:
                summary[0] || {
                    averageRating: 0,
                    totalReviews: 0,
                    rating5: 0,
                    rating4: 0,
                    rating3: 0,
                    rating2: 0,
                    rating1: 0,
                },
        });
    } catch (error) {
        console.error(
            "Get product rating summary error:",
            error
        );

        return res.status(500).json({
            message: "Unable to fetch rating summary",
        });
    }
};

// Update own review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                message: "Invalid review ID",
            });
        }
        const { rating, comment } = req.body;

        // Validate rating
        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be a whole number between 1 and 5",
            });
        }

        // Validate comment
        if (
            typeof comment !== "string" ||
            comment.trim().length < 3
        ) {
            return res.status(400).json({
                message: "Review comment must be at least 3 characters",
            });
        }

        if (comment.trim().length > 1000) {
            return res.status(400).json({
                message: "Review comment cannot exceed 1000 characters",
            });
        }

        // Find review owned by logged-in user
        const review = await Review.findOne({
            _id: reviewId,
            user: req.user._id,
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
            });
        }

        review.rating = rating;
        review.comment = comment.trim();

        await review.save();

        await review.populate("user", "name");

        return res.status(200).json({
            message: "Review updated successfully",
            review,
        });
    } catch (error) {
        console.error("Update review error:", error);

        return res.status(500).json({
            message: "Unable to update review",
        });
    }
};

// Delete own review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                message: "Invalid review ID",
            });
        }

        // Find review owned by logged-in user
        const review = await Review.findOne({
            _id: reviewId,
            user: req.user._id,
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
            });
        }

        await Review.deleteOne({
            _id: reviewId,
            user: req.user._id,
        });

        return res.status(200).json({
            message: "Review deleted successfully",
        });
    } catch (error) {
        console.error("Delete review error:", error);

        return res.status(500).json({
            message: "Unable to delete review",
        });
    }
};
// Get all reviews for admin
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("user", "name email")
            .populate("product", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            reviews,
        });
    } catch (error) {
        console.error("Get all reviews error:", error);

        return res.status(500).json({
            message: "Unable to fetch reviews",
        });
    }
};

// Update review visibility status
const updateReviewStatus = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { status } = req.body;

        if (!["published", "hidden"].includes(status)) {
            return res.status(400).json({
                message: "Invalid review status",
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
            });
        }

        review.status = status;

        await review.save();

        return res.status(200).json({
            message: "Review status updated successfully",
            review,
        });
    } catch (error) {
        console.error(
            "Update review status error:",
            error
        );

        return res.status(500).json({
            message: "Unable to update review status",
        });
    }
};

module.exports = {
    getProductReviews,
    getReviewEligibility,
    addReview,
    getProductRatingSummary,
    updateReview,
    deleteReview,
    getAllReviews,
    updateReviewStatus,
};