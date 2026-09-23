const express = require("express");
const multer = require("multer");

const {
    uploadProductImage,
} = require("../controllers/imageController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPEG, PNG and WebP images are allowed"));
        }

        cb(null, true);
    },
});

router.post(
    "/product",
    protect,
    adminOnly,
    upload.array("images", 6),
    uploadProductImage
);

module.exports = router;