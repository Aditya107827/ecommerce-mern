const fs = require("fs/promises");
const cloudinary = require("../config/cloudinary");
const StoreSettings = require("../models/storeSettings");
const uploadProductImage = async (req, res) => {
    const uploadedImages = [];

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "At least one image is required",
            });
        }

        for (const file of req.files) {
            try {
                const result = await cloudinary.uploader.upload(
                    file.path,
                    {
                        folder: "e-shop/products",
                        resource_type: "image",
                    }
                );

                uploadedImages.push({
                    url: result.secure_url,
                    publicId: result.public_id,
                });

                // Delete temporary local file
                try {
                    await fs.unlink(file.path);
                } catch (cleanupError) {
                    console.error(
                        "Temporary image cleanup failed:",
                        cleanupError.message
                    );
                }
            } catch (uploadError) {
                console.error(
                    "Cloudinary upload failed:",
                    uploadError.message
                );

                // Delete temporary file if Cloudinary upload fails
                try {
                    await fs.unlink(file.path);
                } catch (cleanupError) {
                    console.error(
                        "Temporary file cleanup failed:",
                        cleanupError.message
                    );
                }

                throw uploadError;
            }
        }

        return res.status(200).json({
            message: "Images uploaded successfully",
            images: uploadedImages,
        });
    } catch (error) {
        console.error("Image upload error:", error);

        for (const image of uploadedImages) {
            try {
                await cloudinary.uploader.destroy(image.publicId);
            } catch (cleanupError) {
                console.error(
                    "Cloudinary cleanup failed:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            message: "Failed to upload images",
        });
    }
};
const uploadHeroImage = async (req, res) => {
    let uploadedImage = null;

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

        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "e-shop/store",
                resource_type: "image",
            }
        );

        uploadedImage = {
            url: result.secure_url,
            publicId: result.public_id,
        };

        const oldPublicId = settings.heroImage?.publicId;

        settings.heroImage = uploadedImage;

        await settings.save();

        // Delete old hero image only after new image is saved successfully
        if (oldPublicId) {
            try {
                await cloudinary.uploader.destroy(oldPublicId);
            } catch (cleanupError) {
                console.error(
                    "Old hero image cleanup failed:",
                    cleanupError.message
                );
            }
        }

        try {
            await fs.unlink(req.file.path);
        } catch (cleanupError) {
            console.error(
                "Temporary hero image cleanup failed:",
                cleanupError.message
            );
        }

        return res.status(200).json({
            message: "Hero image updated successfully",
            heroImage: settings.heroImage,
        });
    } catch (error) {
        console.error("Hero image upload error:", error);

        if (uploadedImage?.publicId) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedImage.publicId
                );
            } catch (cleanupError) {
                console.error(
                    "New hero image cleanup failed:",
                    cleanupError.message
                );
            }
        }

        if (req.file?.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError) {
                console.error(
                    "Temporary hero file cleanup failed:",
                    cleanupError.message
                );
            }
        }

        return res.status(500).json({
            message: "Failed to update hero image",
        });
    }
};

module.exports = {
    uploadProductImage,
    uploadHeroImage,
};