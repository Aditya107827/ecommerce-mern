const express = require("express");

const router = express.Router();

const {
    getProductReviews,
    getReviewEligibility,
    addReview,
    getProductRatingSummary,
    updateReview,
    deleteReview,
    getAllReviews,
    updateReviewStatus,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Admin
router.get("/admin/all", protect, adminOnly, getAllReviews);

router.put(
    "/admin/:reviewId/status",
    protect,
    adminOnly,
    updateReviewStatus
);

// Public
router.get("/product/:productId", getProductReviews);

router.get(
    "/product/:productId/summary",
    getProductRatingSummary
);

// Logged-in users
router.get(
    "/product/:productId/eligibility",
    protect,
    getReviewEligibility
);
router.post("/product/:productId", protect, addReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;