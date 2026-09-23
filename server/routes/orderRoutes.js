const express = require("express");

const router = express.Router();

const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    cancelOrder,
    updateOrderStatus,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");


// All order routes require login
router.use(protect);


// ==========================================
// Admin Routes
// ==========================================

router.get(
    "/admin/all",
    adminOnly,
    getAllOrders
);

router.put(
    "/admin/:id/status",
    adminOnly,
    updateOrderStatus
);


// ==========================================
// Customer Routes
// ==========================================

router.get(
    "/",
    getMyOrders
);

router.get(
    "/:id",
    getOrderById
);

router.post(
    "/",
    createOrder
);
router.put(
    "/:id/cancel",
    cancelOrder
);


module.exports = router;