const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            default: "",
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        _id: false,
    }
);

const statusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            required: true,
        },

        changedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);


const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        addressLine1: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        addressLine2: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        state: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        postalCode: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            default: "India",
            trim: true,
            maxlength: 100,
        },
    },
    { _id: false }
);


const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one product",
            },
        },

        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        shippingCharge: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded",
            ],
            default: "pending",
        },

        paymentMethod: {
            type: String,
            enum: [
                "cod",
                "online",
            ],
            default: "cod",
        },

        paymentReference: {
            type: String,
            default: "",
            trim: true,
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);