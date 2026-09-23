const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
// Get all products
const getProducts = async (req, res) => {
    try {
        const {
            search,
            category,
            page = 1,
            limit = 12,
            sort = "newest",
        } = req.query;

        const filter = {};

        if (search?.trim()) {
            const searchTerm = search
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.$or = [
                {
                    name: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    category: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                },
            ];
        }

        if (category?.trim() && category !== "all") {
            filter.category = category.trim();
        }

        const pageNumber = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(parseInt(limit, 10) || 12, 1),
            50
        );

        const skip = (pageNumber - 1) * limitNumber;

        let sortOption = { createdAt: -1 };

        switch (sort) {
            case "price_asc":
                sortOption = { price: 1 };
                break;

            case "price_desc":
                sortOption = { price: -1 };
                break;

            case "newest":
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limitNumber),

            Product.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(
            totalProducts / limitNumber
        );

        res.status(200).json({
            products,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalProducts,
                limit: limitNumber,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1,
            },
        });
    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            message: "Failed to fetch products",
        });
    }
};

// Get all product categories
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category");

        const cleanedCategories = categories
            .map((category) => category?.trim())
            .filter(Boolean)
            .sort((a, b) =>
                a.localeCompare(b, undefined, {
                    sensitivity: "base",
                })
            );

        res.status(200).json({
            categories: cleanedCategories,
        });
    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            message: "Failed to fetch categories",
        });
    }
};

// Get single product
const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch product",
        });
    }
};

// Create product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            images,
            description,
            stock,
            featured,
        } = req.body;

        if (!Array.isArray(images)) {
            return res.status(400).json({
                message: "Images must be an array",
            });
        }
        if (typeof featured !== "boolean") {
            return res.status(400).json({
                message: "Featured must be a boolean",
            });
        }

        if (!name?.trim() || !category?.trim()) {
            return res.status(400).json({
                message: "Product name and category are required",
            });
        }

        if (
            !Number.isFinite(Number(price)) ||
            !Number.isFinite(Number(stock)) ||
            Number(price) < 0 ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                message: "Price and stock must be valid non-negative numbers",
            });
        }

        const product = await Product.create({
            name,
            category,
            price: Number(price),
            images,
            description,
            stock: Number(stock),
            featured,
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create product",

        });
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        if (!req.body.name?.trim() || !req.body.category?.trim()) {
            return res.status(400).json({
                message: "Product name and category are required",
            });
        }

        if (
            !Number.isFinite(Number(req.body.price)) ||
            !Number.isFinite(Number(req.body.stock)) ||
            Number(req.body.price) < 0 ||
            Number(req.body.stock) < 0
        ) {
            return res.status(400).json({
                message: "Price and stock must be valid non-negative numbers",
            });
        }
        if (!Array.isArray(req.body.images)) {
            return res.status(400).json({
                message: "Images must be an array",
            });
        }

        if (typeof req.body.featured !== "boolean") {
            return res.status(400).json({
                message: "Featured must be a boolean",
            });
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const oldImages = product.images || [];
        const newImages = req.body.images || [];

        // Find images removed during product edit
        const removedImages = oldImages.filter(
            (oldImage) =>
                !newImages.some(
                    (newImage) =>
                        newImage.publicId === oldImage.publicId
                )
        );

        // Delete removed images from Cloudinary
        for (const image of removedImages) {
            if (image.publicId) {
                try {
                    await cloudinary.uploader.destroy(
                        image.publicId,
                        {
                            resource_type: "image",
                        }
                    );
                } catch (cloudinaryError) {
                    console.error(
                        "Cloudinary image deletion failed:",
                        cloudinaryError.message
                    );
                }
            }
        }

        // Update product in MongoDB
        product.name = req.body.name;
        product.category = req.body.category;
        product.price = Number(req.body.price);
        product.images = req.body.images;
        product.description = req.body.description;
        product.stock = Number(req.body.stock);
        product.featured = req.body.featured;

        await product.save();

        res.status(200).json(product);
    } catch (error) {
        console.error("Update product error:", error);

        res.status(400).json({
            message: "Failed to update product",

        });
    }
};

// Delete product
const deleteProduct = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // Delete product images from Cloudinary
        if (product.images?.length > 0) {
            for (const image of product.images) {
                if (image.publicId) {
                    try {
                        await cloudinary.uploader.destroy(
                            image.publicId,
                            {
                                resource_type: "image",
                            }
                        );
                    } catch (cloudinaryError) {
                        console.error(
                            "Cloudinary image deletion failed:",
                            cloudinaryError.message
                        );
                    }
                }
            }
        }

        // Delete product from MongoDB
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product and images deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            message: "Failed to delete product",

        });
    }
};

module.exports = {
    getProducts,
    getCategories,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};