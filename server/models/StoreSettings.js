const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
    {
        heroImage: {
            url: {
                type: String,
                default: "",
            },
            publicId: {
                type: String,
                default: "",
            },
        },
        heroSlides: [
            {
                image: {
                    url: {
                        type: String,
                        default: "",
                    },
                    publicId: {
                        type: String,
                        default: "",
                    },
                },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    default: null,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.StoreSettings ||
    mongoose.model("StoreSettings", storeSettingsSchema);