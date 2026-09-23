const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId).select(
            "-password"
        );

        

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({
                message: "Session expired. Please login again.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been disabled",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please login again.",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid authentication session",
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            message: "Authentication failed",
        });
    }
};



module.exports = {
    protect,
    
};