const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");
// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
            tokenVersion: user.tokenVersion,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};
const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

// Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone ? phone.trim() : "",
        });

        res.status(201).json({
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Unable to create account",
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been disabled",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Unable to login",
        });
    }
};


// Logout User
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Unable to logout",
        });
    }
};

// Get current authenticated user
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role,
                address: req.user.address,
            },
        });
    } catch (error) {
        console.error("Get current user error:", error);

        res.status(500).json({
            message: "Unable to fetch user",
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        // Same response whether account exists or not
        // to prevent email enumeration.
        if (!user) {
            return res.status(200).json({
                message:
                    "If an account exists with this email, a password reset link has been sent.",
            });
        }

        const safeName = escapeHtml(user.name);

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;

        // Token valid for 30 minutes
        user.resetPasswordExpires = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Reset Your E-Shop Password",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2>Password Reset Request</h2>

            <p>Hello ${safeName},</p>

            <p>
                We received a request to reset your E-Shop account password.
            </p>

            <p>
                Click the button below to create a new password:
            </p>

            <a
                href="${resetUrl}"
                style="
                    display: inline-block;
                    padding: 12px 20px;
                    background: #000;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 6px;
                "
            >
                Reset Password
            </a>

            <p style="margin-top: 20px;">
                This link will expire in 30 minutes.
            </p>

            <p>
                If you did not request a password reset, you can safely ignore
                this email.
            </p>

            <p>
                Regards,<br />
                E-Shop Team
            </p>
        </div>
    `,
        });

        return res.status(200).json({
            message:
                "If an account exists with this email, a password reset link has been sent.",
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            message: "Unable to process password reset request",
        });
    }
};



const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (typeof token !== "string" || !token) {
            return res.status(400).json({
                message: "Invalid password reset token",
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }


        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                $gt: new Date(),
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired password reset token",
            });
        }

        user.password = await bcrypt.hash(password, 12);

        user.tokenVersion += 1;

        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        return res.status(200).json({
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Unable to reset password",
        });
    }
};

// Update current authenticated user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        if (name.trim().length < 2 || name.trim().length > 100) {
            return res.status(400).json({
                message: "Name must be between 2 and 100 characters",
            });
        }

        if (
            phone !== undefined &&
            phone !== null &&
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit phone number",
            });
        }

        if (phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit phone number",
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.name = name.trim();
        user.phone = phone?.trim() || "";

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            message: "Unable to update profile",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
};