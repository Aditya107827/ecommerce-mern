const fs = require("fs/promises");
const cloudinary = require("../config/cloudinary");

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

module.exports = {
    uploadProductImage,
};