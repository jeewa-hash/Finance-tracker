const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");  // Authentication middleware
const admin = require("../middleware/admin");      // Admin authorization middleware
const { getSettings, updateSettings , createSettings} = require("../controllers/settingsController");

router.post("/", protect, admin, createSettings);

// @route GET /api/settings
// @desc Get system settings (Categories & Limits)
// @access Admin Only
router.get("/", protect, admin, getSettings);

// @route PUT /api/settings
// @desc Update system settings (Categories & Limits)
// @access Admin Only
router.put("/", protect, admin, updateSettings);

module.exports = router;
