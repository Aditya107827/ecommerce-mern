const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Snapshot of user's name at the time of review
        userName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: "Rating must be a whole number between 1 and 5",
            },
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 1000,
        },

        verifiedPurchase: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["published", "hidden"],
            default: "published",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// One review per user for each product
reviewSchema.index(
    { product: 1, user: 1 },
    { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);