const express = require("express");

const router = express.Router();

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");


// All cart routes require authentication
router.use(protect);


// Get current user's cart
router.get("/", getCart);

// Add product
router.post("/", addToCart);

// Update quantity
router.put("/:productId", updateCartItem);

// Remove product
router.delete("/:productId", removeFromCart);

// Clear cart
router.delete("/", clearCart);


module.exports = router;