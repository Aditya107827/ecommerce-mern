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
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.StoreSettings ||
    mongoose.model("StoreSettings", storeSettingsSchema);