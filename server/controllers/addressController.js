const Address = require("../models/Address");
const mongoose = require("mongoose");
const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);

const validatePostalCode = (postalCode) =>
    /^\d{6}$/.test(postalCode);

// Get all addresses of logged-in user
const getMyAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            user: req.user._id,
        }).sort({
            isDefault: -1,
            createdAt: -1,
        });

        return res.status(200).json({
            addresses,
        });
    } catch (error) {
        console.error("Get addresses error:", error);

        return res.status(500).json({
            message: "Unable to fetch addresses",
        });
    }
};

// Add new address
const createAddress = async (req, res) => {
    try {
        const {
            label = "Home",
            fullName,
            phone,
            addressLine1,
            addressLine2 = "",
            city,
            state,
            postalCode,
            country = "India",
            isDefault = false,
        } = req.body;

        if (
            typeof fullName !== "string" ||
            typeof phone !== "string" ||
            typeof addressLine1 !== "string" ||
            typeof addressLine2 !== "string" ||
            typeof city !== "string" ||
            typeof state !== "string" ||
            typeof postalCode !== "string" ||
            typeof country !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid address data",
            });
        }

        if (
            fullName.trim().length < 2 ||
            fullName.trim().length > 100 ||
            addressLine1.trim().length > 200 ||
            addressLine2.trim().length > 200 ||
            city.trim().length > 100 ||
            state.trim().length > 100
        ) {
            return res.status(400).json({
                message: "Address field length is invalid",
            });
        }


        if (!["Home", "Office", "Other"].includes(label)) {
            return res.status(400).json({
                message: "Invalid address label",
            });
        }

        if (typeof isDefault !== "boolean") {
            return res.status(400).json({
                message: "Invalid default address value",
            });
        }


        if (!validatePhone(phone.trim())) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit phone number",
            });
        }

        if (!validatePostalCode(postalCode.trim())) {
            return res.status(400).json({
                message: "Please enter a valid 6-digit postal code",
            });
        }

        const addressCount = await Address.countDocuments({
            user: req.user._id,
        });

        const shouldBeDefault =
            addressCount === 0 || isDefault === true;

        if (shouldBeDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.create({
            user: req.user._id,
            label,
            fullName: fullName.trim(),
            phone: phone.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2?.trim() || "",
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country: country?.trim() || "India",
            isDefault: shouldBeDefault,
        });

        return res.status(201).json({
            message: "Address added successfully",
            address,
        });
    } catch (error) {
        console.error("Create address error:", error);

        return res.status(500).json({
            message: "Unable to add address",
        });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid address ID",
            });
        }
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        const {
            label,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault,
        } = req.body;

        if (
            typeof fullName !== "string" ||
            typeof phone !== "string" ||
            typeof addressLine1 !== "string" ||
            typeof addressLine2 !== "string" ||
            typeof city !== "string" ||
            typeof state !== "string" ||
            typeof postalCode !== "string" ||
            typeof country !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid address data",
            });
        }

        if (
            fullName.trim().length < 2 ||
            fullName.trim().length > 100 ||
            addressLine1.trim().length > 200 ||
            addressLine2.trim().length > 200 ||
            city.trim().length > 100 ||
            state.trim().length > 100
        ) {
            return res.status(400).json({
                message: "Address field length is invalid",
            });
        }

        if (!["Home", "Office", "Other"].includes(label)) {
            return res.status(400).json({
                message: "Invalid address label",
            });
        }

        if (typeof isDefault !== "boolean") {
            return res.status(400).json({
                message: "Invalid default address value",
            });
        }

        if (!validatePhone(phone.trim())) {
            return res.status(400).json({
                message: "Please enter a valid 10-digit phone number",
            });
        }

        if (!validatePostalCode(postalCode.trim())) {
            return res.status(400).json({
                message: "Please enter a valid 6-digit postal code",
            });
        }

        if (isDefault === true) {
            await Address.updateMany(
                {
                    user: req.user._id,
                    _id: { $ne: address._id },
                },
                { $set: { isDefault: false } }
            );
        }

        address.label = label || address.label;
        address.fullName = fullName.trim();
        address.phone = phone.trim();
        address.addressLine1 = addressLine1.trim();
        address.addressLine2 = addressLine2?.trim() || "";
        address.city = city.trim();
        address.state = state.trim();
        address.postalCode = postalCode.trim();
        address.country = country?.trim() || "India";
        address.isDefault = isDefault === true;

        await address.save();

        return res.status(200).json({
            message: "Address updated successfully",
            address,
        });
    } catch (error) {
        console.error("Update address error:", error);

        return res.status(500).json({
            message: "Unable to update address",
        });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid address ID",
            });
        }
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        await address.deleteOne();

        if (address.isDefault) {
            const nextAddress = await Address.findOne({
                user: req.user._id,
            }).sort({
                createdAt: -1,
            });

            if (nextAddress) {
                nextAddress.isDefault = true;
                await nextAddress.save();
            }
        }

        return res.status(200).json({
            message: "Address deleted successfully",
        });
    } catch (error) {
        console.error("Delete address error:", error);

        return res.status(500).json({
            message: "Unable to delete address",
        });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid address ID",
            });
        }
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        await Address.updateMany(
            {
                user: req.user._id,
                _id: { $ne: address._id },
            },
            { $set: { isDefault: false } }
        );

        address.isDefault = true;
        await address.save();

        return res.status(200).json({
            message: "Default address updated successfully",
            address,
        });
    } catch (error) {
        console.error("Set default address error:", error);

        return res.status(500).json({
            message: "Unable to set default address",
        });
    }
};

module.exports = {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};