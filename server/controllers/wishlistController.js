const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const mongoose = require("mongoose");
// Get current user's wishlist
const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({
            user: req.user._id,
        }).populate(
            "products",
            "name price images image category stock featured"
        );

        // Create wishlist if it doesn't exist
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [],
            });
        }

        return res.status(200).json(wishlist);
    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            message: "Unable to fetch wishlist",
        });
    }
};


// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
            });
        }

        // Check whether product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        let wishlist = await Wishlist.findOne({
            user: req.user._id,
        });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user._id,
                products: [],
            });
        }

        // Check if already in wishlist
        const alreadyExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                message: "Product is already in your wishlist",
            });
        }

        wishlist.products.push(productId);

        await wishlist.save();

        await wishlist.populate(
            "products",
            "name price images image category stock featured"
        );

        return res.status(200).json({
            message: "Product added to wishlist",
            wishlist,
        });
    } catch (error) {
        console.error("Add wishlist error:", error);

        return res.status(500).json({
            message: "Unable to add product to wishlist",
        });
    }
};


// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found",
            });
        }

        const exists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                message: "Product is not in your wishlist",
            });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        await wishlist.populate(
            "products",
            "name price images image category stock featured"
        );

        return res.status(200).json({
            message: "Product removed from wishlist",
            wishlist,
        });
    } catch (error) {
        console.error("Remove wishlist error:", error);

        return res.status(500).json({
            message: "Unable to remove product from wishlist",
        });
    }
};


// Clear entire wishlist
const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        });

        if (!wishlist) {
            return res.status(200).json({
                message: "Wishlist is already empty",
                wishlist: {
                    products: [],
                },
            });
        }

        wishlist.products = [];

        await wishlist.save();

        return res.status(200).json({
            message: "Wishlist cleared successfully",
            wishlist,
        });
    } catch (error) {
        console.error("Clear wishlist error:", error);

        return res.status(500).json({
            message: "Unable to clear wishlist",
        });
    }
};


module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
};