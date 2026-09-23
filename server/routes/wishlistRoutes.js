const express = require("express");

const router = express.Router();

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

// All wishlist routes require authentication
router.use(protect);

// Get current user's wishlist
router.get("/", getWishlist);

// Add product
router.post("/", addToWishlist);

// Remove product
router.delete("/:productId", removeFromWishlist);

// Clear wishlist
router.delete("/", clearWishlist);

module.exports = router;