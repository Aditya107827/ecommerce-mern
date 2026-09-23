const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalCustomers,
            totalProducts,
            totalOrders,
            pendingOrders,
            lowStockProducts,
            outOfStockProducts,
            salesResult,
            recentOrders,
        ] = await Promise.all([
            // Customers
            User.countDocuments({
                role: "customer",
            }),

            // Products
            Product.countDocuments(),

            // Orders
            Order.countDocuments(),

            // Pending orders
            Order.countDocuments({
                orderStatus: "pending",
            }),

            // Low stock
            Product.countDocuments({
                stock: {
                    $gt: 0,
                    $lte: 5,
                },
            }),

            // Out of stock
            Product.countDocuments({
                stock: 0,
            }),

            // Total sales
            Order.aggregate([
                {
                    $match: {
                        orderStatus: "delivered",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$total",
                        },
                    },
                },
            ]),

            // Recent orders
            Order.find()
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5),
        ]);

        const totalSales =
            salesResult.length > 0
                ? salesResult[0].total
                : 0;

        return res.status(200).json({
            stats: {
                totalCustomers,
                totalProducts,
                totalOrders,
                totalSales,
                pendingOrders,
                lowStockProducts,
                outOfStockProducts,
            },

            recentOrders,
        });

    } catch (error) {
        console.error(
            "Dashboard stats error:",
            error
        );

        return res.status(500).json({
            message: "Unable to fetch dashboard statistics",
        });
    }
};

module.exports = {
    getDashboardStats,
};