const express = require("express");
const {
    forgotPasswordLimiter,
    loginLimiter,
} = require("../middleware/rateLimitMiddleware");

const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginLimiter, loginUser);

router.post("/logout", logoutUser);

router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPassword
);

router.post("/reset-password/:token", resetPassword);

router.get("/me", protect, getMe);

router.put("/profile", protect, updateProfile);

module.exports = router;