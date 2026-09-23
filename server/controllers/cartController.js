const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
// Get current user's cart
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user: req.user._id,
        }).populate(
            "items.product",
            "name price images image category stock"
        );

        // Create an empty cart if user doesn't have one yet
        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [],
            });
        }

        return res.status(200).json(cart);
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            message: "Unable to fetch cart",
        });
    }
};


// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const requestedQuantity = Number(quantity);

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1
        ) {
            return res.status(400).json({
                message: "Quantity must be a positive integer",
            });
        }

        // Check product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // Check stock
        if (product.stock < requestedQuantity) {
            return res.status(400).json({
                message: "Requested quantity is not available in stock",
            });
        }

        let cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [],
            });
        }

        // Check whether product already exists
        const existingItem = cart.items.find(
            (item) =>
                item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity =
                existingItem.quantity + requestedQuantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) available in stock`,
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity: requestedQuantity,
            });
        }

        await cart.save();

        await cart.populate(
            "items.product",
            "name price images image category stock"
        );

        return res.status(200).json({
            message: "Product added to cart",
            cart,
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            message: "Unable to add product to cart",
        });
    }
};


// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const updatedQuantity = Number(quantity);

        if (
            !Number.isInteger(updatedQuantity) ||
            updatedQuantity < 1
        ) {
            return res.status(400).json({
                message: "Quantity must be a positive integer",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        if (updatedQuantity > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} item(s) available in stock`,
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        const item = cart.items.find(
            (cartItem) =>
                cartItem.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product is not in your cart",
            });
        }

        item.quantity = updatedQuantity;

        await cart.save();

        await cart.populate(
            "items.product",
            "name price images image category stock"
        );

        return res.status(200).json({
            message: "Cart updated successfully",
            cart,
        });
    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            message: "Unable to update cart",
        });
    }
};


// Remove product from cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        const itemExists = cart.items.some(
            (item) =>
                item.product.toString() === productId
        );

        if (!itemExists) {
            return res.status(404).json({
                message: "Product is not in your cart",
            });
        }

        cart.items = cart.items.filter(
            (item) =>
                item.product.toString() !== productId
        );

        await cart.save();

        await cart.populate(
            "items.product",
            "name price images image category stock"
        );

        return res.status(200).json({
            message: "Product removed from cart",
            cart,
        });
    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            message: "Unable to remove product from cart",
        });
    }
};


// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(200).json({
                message: "Cart is already empty",
                cart: {
                    items: [],
                },
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            message: "Cart cleared successfully",
            cart,
        });
    } catch (error) {
        console.error("Clear cart error:", error);

        return res.status(500).json({
            message: "Unable to clear cart",
        });
    }
};


module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};