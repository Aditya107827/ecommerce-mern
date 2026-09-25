const express = require("express");

const {
    getStoreSettings,
} = require("../controllers/storeSettingsController");

const router = express.Router();

router.get("/", getStoreSettings);

module.exports = router;