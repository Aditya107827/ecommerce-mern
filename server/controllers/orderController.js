const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const User = require("../models/User");
const { sendEmail } = require("../services/emailService");
const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
// ==========================================
// CREATE ORDER - Customer
// ==========================================

const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const {
            shippingAddress,
            paymentMethod = "cod",
        } = req.body;

        // Validate shipping address
        if (!shippingAddress) {
            return res.status(400).json({
                message: "Complete shipping address is required",
            });
        }
        if (
            typeof shippingAddress !== "object" ||
            Array.isArray(shippingAddress)
        ) {
            return res.status(400).json({
                message: "Invalid shipping address",
            });
        }

        if (
            typeof shippingAddress.fullName !== "string" ||
            typeof shippingAddress.phone !== "string" ||
            typeof shippingAddress.addressLine1 !== "string" ||
            typeof shippingAddress.city !== "string" ||
            typeof shippingAddress.state !== "string" ||
            typeof shippingAddress.postalCode !== "string" ||
            (shippingAddress.addressLine2 !== undefined &&
                typeof shippingAddress.addressLine2 !== "string") ||
            (shippingAddress.country !== undefined &&
                typeof shippingAddress.country !== "string")
        ) {
            return res.status(400).json({
                message: "Invalid shipping address data",
            });
        }

        const requiredFields = [
            shippingAddress.fullName,
            shippingAddress.phone,
            shippingAddress.addressLine1,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.postalCode,
        ];

        if (requiredFields.some((field) => !field?.trim())) {
            return res.status(400).json({
                message: "Complete shipping address is required",
            });
        }

        if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit phone number",
            });
        }

        if (!/^\d{6}$/.test(shippingAddress.postalCode.trim())) {
            return res.status(400).json({
                message: "Please enter a valid 6-digit postal code",
            });
        }

        // Validate payment method
        if (!["cod", "online"].includes(paymentMethod)) {
            return res.status(400).json({
                message: "Invalid payment method",
            });
        }

        session.startTransaction();

        // Get user's cart
        const cart = await Cart.findOne({
            user: req.user._id,
        }).session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();

            return res.status(400).json({
                message: "Your cart is empty",
            });
        }

        const orderItems = [];
        let subtotal = 0;

        // Verify products and stock
        for (const cartItem of cart.items) {
            const product = await Product.findById(
                cartItem.product
            ).session(session);

            if (!product) {
                await session.abortTransaction();

                return res.status(404).json({
                    message:
                        "One or more products in your cart no longer exist",
                });
            }

            if (product.stock < cartItem.quantity) {
                await session.abortTransaction();

                return res.status(400).json({
                    message: `${product.name} does not have enough stock`,
                });
            }

            const itemTotal =
                product.price * cartItem.quantity;

            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                image:
                    product.images?.[0]?.url ||
                    product.image ||
                    "",
                price: product.price,
                quantity: cartItem.quantity,
            });
        }

        // Shipping
        const shippingCharge =
            subtotal >= 1000 ? 0 : 50;

        const total = subtotal + shippingCharge;

        // Reduce stock
        for (const cartItem of cart.items) {
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: cartItem.product,
                    stock: { $gte: cartItem.quantity },
                },
                {
                    $inc: {
                        stock: -cartItem.quantity,
                    },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!updatedProduct) {
                await session.abortTransaction();

                return res.status(400).json({
                    message: "Product stock changed. Please review your cart and try again.",
                });
            }
        }

        // Create order
        const orders = await Order.create(
            [
                {
                    user: req.user._id,

                    items: orderItems,

                    shippingAddress: {
                        fullName:
                            shippingAddress.fullName.trim(),

                        phone:
                            shippingAddress.phone.trim(),

                        addressLine1:
                            shippingAddress.addressLine1.trim(),

                        addressLine2:
                            shippingAddress.addressLine2?.trim() ||
                            "",

                        city:
                            shippingAddress.city.trim(),

                        state:
                            shippingAddress.state.trim(),

                        postalCode:
                            shippingAddress.postalCode.trim(),

                        country:
                            shippingAddress.country?.trim() ||
                            "India",
                    },

                    subtotal,
                    shippingCharge,
                    total,

                    paymentStatus: "pending",
                    paymentMethod,
                    orderStatus: "pending",
                    statusHistory: [
                        {
                            status: "pending",
                        },
                    ],
                },

            ],
            { session }
        );

        const order = orders[0];

        // Clear cart
        cart.items = [];

        await cart.save({ session });

        await session.commitTransaction();

        try {
            const user = await User.findById(req.user._id).select(
                "name email"
            );

            if (user?.email) {
                await sendEmail({
                    to: user.email,
                    subject: "Order Confirmation - E-Shop",
                    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Order Confirmed 🎉</h2>

                    <p>Hello ${escapeHtml(user.name)},</p>

                    <p>
                        Thank you for your order. Your order has been
                        successfully placed.
                    </p>

                    <p>
                        <strong>Order ID:</strong> ${order._id}
                    </p>

                    <h3>Order Summary</h3>

                    <ul>
                        ${order.items
                            .map(
                                (item) =>
                                    `<li>
                                        ${escapeHtml(item.name)} × ${item.quantity}
                                        — ₹${item.price * item.quantity}
                                    </li>`
                            )
                            .join("")}
                    </ul>

                    <p>
                        <strong>Subtotal:</strong> ₹${order.subtotal}
                    </p>

                    <p>
                        <strong>Shipping:</strong> ₹${order.shippingCharge}
                    </p>

                    <p>
                        <strong>Total:</strong> ₹${order.total}
                    </p>

                    <p>
                        <strong>Payment Method:</strong>
                        ${order.paymentMethod.toUpperCase()}
                    </p>

                    <p>
                        We will keep you updated about your order status.
                    </p>

                    <p>
                        Regards,<br />
                        E-Shop Team
                    </p>
                </div>
            `,
                });
            }
        } catch (emailError) {
            console.error(
                "Order confirmation email failed:",
                emailError.message
            );
        }

        return res.status(201).json({
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error(
            "Create order error:",
            error
        );

        return res.status(500).json({
            message: "Unable to create order",
        });
    } finally {
        await session.endSession();
    }
};


// ==========================================
// GET MY ORDERS - Customer
// ==========================================

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id,
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            orders,
        });

    } catch (error) {
        console.error(
            "Get my orders error:",
            error
        );

        return res.status(500).json({
            message: "Unable to fetch orders",
        });
    }
};


// ==========================================
// GET SINGLE ORDER - Customer
// ==========================================

const getOrderById = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json({
            order,
        });

    } catch (error) {
        console.error(
            "Get order error:",
            error
        );

        return res.status(500).json({
            message: "Unable to fetch order",
        });
    }
};


// ==========================================
// GET ALL ORDERS - Admin
// ==========================================

const getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
        } = req.query;

        const pageNumber = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            50
        );

        const filter = {};

        if (status && status !== "all") {
            const allowedStatuses = [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid order status",
                });
            }

            filter.orderStatus = status;
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter)
                .populate(
                    "user",
                    "name email phone"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limitNumber),

            Order.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(
            totalOrders / limitNumber
        );

        return res.status(200).json({
            orders,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalOrders,
                limit: limitNumber,
                hasNextPage:
                    pageNumber < totalPages,
                hasPreviousPage:
                    pageNumber > 1,
            },
        });

    } catch (error) {
        console.error(
            "Get all orders error:",
            error
        );

        return res.status(500).json({
            message: "Unable to fetch all orders",
        });
    }
};
const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {

        const order = await Order.findById(
            req.params.id
        ).session(session);

        if (!order) {
            await session.abortTransaction();

            return res.status(404).json({
                message: "Order not found",
            });
        }

        // Customer can cancel only their own order
        if (order.user.toString() !== req.user._id.toString()) {
            await session.abortTransaction();

            return res.status(403).json({
                message: "You are not allowed to cancel this order",
            });
        }

        // Already cancelled
        if (order.orderStatus === "cancelled") {
            await session.abortTransaction();

            return res.status(400).json({
                message: "Order is already cancelled",
            });
        }

        // Cannot cancel after shipment
        if (
            ["shipped", "delivered"].includes(
                order.orderStatus
            )
        ) {
            await session.abortTransaction();

            return res.status(400).json({
                message:
                    "Shipped or delivered orders cannot be cancelled",
            });
        }

        // Paid online orders require an actual refund first
        if (
            order.paymentMethod === "online" &&
            order.paymentStatus === "paid"
        ) {
            await session.abortTransaction();

            return res.status(400).json({
                message:
                    "Paid online orders cannot be cancelled until the payment is refunded",
            });
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await Product.findById(
                item.product
            ).session(session);

            // Product may have been deleted after order
            if (!product) {
                continue;
            }

            product.stock += item.quantity;

            await product.save({ session });
        }

        // Update order status
        order.orderStatus = "cancelled";

        order.statusHistory.push({
            status: "cancelled",
            changedAt: new Date(),
        });

        await order.save({ session });

        await session.commitTransaction();

        try {
            const user = await User.findById(order.user).select(
                "name email"
            );

            if (user?.email) {
                await sendEmail({
                    to: user.email,
                    subject: "Order Cancelled - E-Shop",
                    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Order Cancelled</h2>

                    <p>Hello ${escapeHtml(user.name)},</p>

                    <p>
                        Your order has been successfully cancelled.
                    </p>

                    <p>
                        <strong>Order ID:</strong> ${order._id}
                    </p>

                    <p>
                        <strong>Order Total:</strong>
                        ₹${order.total}
                    </p>

                    <p>
                        The stock for the cancelled items has been restored.
                    </p>

                    <p>
                        Regards,<br />
                        E-Shop Team
                    </p>
                </div>
            `,
                });
            }
        } catch (emailError) {
            console.error(
                "Order cancellation email failed:",
                emailError.message
            );
        }

        return res.status(200).json({
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error(
            "Cancel order error:",
            error
        );

        return res.status(500).json({
            message: "Unable to cancel order",
        });
    } finally {
        await session.endSession();
    }
};

// ==========================================
// UPDATE ORDER STATUS - Admin
// ==========================================

const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();

    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid order ID",
            });
        }

        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status",
            });
        }

        session.startTransaction();

        const order = await Order.findById(
            req.params.id
        ).session(session);

        if (!order) {
            await session.abortTransaction();

            return res.status(404).json({
                message: "Order not found",
            });
        }

        // No change needed
        if (order.orderStatus === status) {
            await session.abortTransaction();

            return res.status(400).json({
                message: `Order is already ${status}`,
            });
        }
        const allowedTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["processing", "cancelled"],
            processing: ["shipped", "cancelled"],
            shipped: ["delivered"],
            delivered: [],
            cancelled: [],
        };

        if (!allowedTransitions[order.orderStatus].includes(status)) {
            await session.abortTransaction();

            return res.status(400).json({
                message: `Cannot change order status from ${order.orderStatus} to ${status}`,
            });
        }

        // Prevent cancellation after shipment
        if (
            status === "cancelled" &&
            ["shipped", "delivered"].includes(
                order.orderStatus
            )
        ) {
            await session.abortTransaction();

            return res.status(400).json({
                message:
                    "Shipped or delivered orders cannot be cancelled",
            });
        }

        if (
            status === "cancelled" &&
            order.paymentMethod === "online" &&
            order.paymentStatus === "paid"
        ) {
            await session.abortTransaction();

            return res.status(400).json({
                message:
                    "Paid online orders cannot be cancelled until the payment is refunded",
            });
        }

        // ==========================================
        // Restore stock when order is cancelled
        // ==========================================

        if (
            status === "cancelled" &&
            order.orderStatus !== "cancelled"
        ) {
            for (const item of order.items) {
                const product = await Product.findById(
                    item.product
                ).session(session);

                // Product may have been deleted after order
                if (!product) {
                    continue;
                }

                product.stock += item.quantity;

                await product.save({ session });
            }
        }

        // Update order status
        order.orderStatus = status;

        if (
            status === "delivered" &&
            order.paymentMethod === "cod"
        ) {
            order.paymentStatus = "paid";
        }

        order.statusHistory.push({
            status,
            changedAt: new Date(),
        });

        await order.save({ session });

        await session.commitTransaction();

        try {
            const user = await User.findById(order.user).select(
                "name email"
            );

            if (user?.email) {
                await sendEmail({
                    to: user.email,
                    subject: `Order Status Updated - E-Shop`,
                    html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Order Status Updated</h2>

                    <p>Hello ${escapeHtml(user.name)},</p>

                    <p>
                        Your order status has been updated.
                    </p>

                    <p>
                        <strong>Order ID:</strong> ${order._id}
                    </p>

                    <p>
                        <strong>New Status:</strong>
                        ${order.orderStatus.toUpperCase()}
                    </p>

                    <p>
                        <strong>Order Total:</strong>
                        ₹${order.total}
                    </p>

                    <p>
                        You can log in to your E-Shop account to view
                        your order details.
                    </p>

                    <p>
                        Regards,<br />
                        E-Shop Team
                    </p>
                </div>
            `,
                });
            }
        } catch (emailError) {
            console.error(
                "Order status email failed:",
                emailError.message
            );
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error(
            "Update order status error:",
            error
        );

        return res.status(500).json({
            message: "Unable to update order status",
        });
    } finally {
        await session.endSession();
    }
};


module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    cancelOrder,
    updateOrderStatus,
};