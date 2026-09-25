const StoreSettings = require("../models/StoreSettings");

const getStoreSettings = async (req, res) => {
    try {
        let settings = await StoreSettings.findOne();

        if (!settings) {
            settings = await StoreSettings.create({});
        }

        return res.status(200).json(settings);
    } catch (error) {
        console.error("Get store settings error:", error);

        return res.status(500).json({
            message: "Failed to fetch store settings",
        });
    }
};

const updateStoreHeroImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Hero image is required",
            });
        }

        const settings = await StoreSettings.findOne();

        if (!settings) {
            return res.status(404).json({
                message: "Store settings not found",
            });
        }

        settings.heroImage = {
            url: req.file.path,
            publicId: req.file.filename,
        };

        await settings.save();

        return res.status(200).json({
            message: "Hero image updated successfully",
            heroImage: settings.heroImage,
        });
    } catch (error) {
        console.error("Update hero image error:", error);

        return res.status(500).json({
            message: "Failed to update hero image",
        });
    }
};

module.exports = {
    getStoreSettings,
    updateStoreHeroImage,
};