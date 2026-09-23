const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
            validate: {
                validator: (value) =>
                    value === "" || /^[6-9]\d{9}$/.test(value),
                message: "Please enter a valid 10-digit phone number",
            },
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },

        address: {
            street: {
                type: String,
                trim: true,
                default: "",
            },

            city: {
                type: String,
                trim: true,
                default: "",
            },

            state: {
                type: String,
                trim: true,
                default: "",
            },

            pincode: {
                type: String,
                trim: true,
                default: "",
            },
        },

        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },

        tokenVersion: {
            type: Number,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);