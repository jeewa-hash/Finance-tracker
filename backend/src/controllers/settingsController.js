const Settings = require("../models/Settings");



// @desc Create system settings if not already created
// @route POST /api/settings
// @access Admin Only
const createSettings = async (req, res) => {
  try {
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      return res.status(400).json({ message: "Settings already exist" });
    }

    // Create new settings if they do not exist
    const { categories, limits } = req.body;
    
    // Set default categories and limits if not provided
    const newSettings = new Settings({
      categories: categories || [
        // Default categories can be added here
        "Housing - Rent/Mortgage", "Utilities - Electricity", "Groceries - Supermarket", "Healthcare - Doctor Visits",
        "Emergency Fund", "Retirement Savings", "Credit Card - Bill Payment", "Dining Out - Restaurants",
        "Salary - Primary Job", "Freelance Work"
      ],
      limits: limits || {
        transactionLimit: 10000,  // Default limit
        monthlyLimit: 50000      // Default monthly limit
      }
    });

    await newSettings.save();
    res.status(201).json({ message: "Settings created successfully", settings: newSettings });
  } catch (error) {
    console.error("Error creating settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// @desc Get system settings
// @route GET /api/settings
// @access Admin Only
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Update system settings (categories & limits)
// @route PUT /api/settings
// @access Admin Only
const updateSettings = async (req, res) => {
  try {
    const { categories, limits } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({});
    }

    if (categories) settings.categories = categories;
    if (limits) {
      if (limits.transactionLimit !== undefined) settings.limits.transactionLimit = limits.transactionLimit;
      if (limits.monthlyLimit !== undefined) settings.limits.monthlyLimit = limits.monthlyLimit;
    }

    await settings.save();
    res.status(200).json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSettings, updateSettings, createSettings };
