const express = require("express");

const router = express.Router();

const {
    getDashboardStats,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");


// All admin routes require authentication
router.use(protect);

// All admin routes require admin role
router.use(adminOnly);


// Dashboard
router.get(
    "/dashboard",
    getDashboardStats
);


module.exports = router;