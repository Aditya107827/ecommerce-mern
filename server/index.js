require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const imageRoutes = require("./routes/imageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addressRoutes = require("./routes/addressRoutes");
const storeSettingsRoutes = require("./routes/storeSettingsRoutes");
const helmet = require("helmet");
const multer = require("multer");
const app = express();


// Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
// MongoDB Connection
connectDB();

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/store-settings", storeSettingsRoutes);
// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "E-Shop API is running",
    });
});

app.use((err, req, res, next) => {
    console.error("Server error:", err);

    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        err.type === "entity.parse.failed"
    ) {
        return res.status(400).json({
            message: "Invalid JSON",
        });
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: "File upload failed",
        });
    }

    if (err.message === "Only JPEG, PNG and WebP images are allowed") {
        return res.status(400).json({
            message: err.message,
        });
    }

    return res.status(500).json({
        message: "Something went wrong",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});