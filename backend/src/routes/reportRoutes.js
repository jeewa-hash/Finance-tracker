const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middleware/auth"); // Import protect middleware
const admin = require("../middleware/admin"); // Import admin middleware

// ✅ Get all transactions for a user (Authenticated)
router.get("/user/:userId", protect, reportController.getUserTransactions);

// ✅ Get spending trends over time (Authenticated)
router.get("/spending-trends", protect, reportController.getSpendingTrends);

// ✅ Get income vs. expenses summary (Authenticated)
router.get("/income-expense", protect, reportController.getIncomeVsExpense);

// ✅ Filter transactions by time period, category, or tags (Authenticated)
router.get("/filter", protect, reportController.filterTransactions);

// ✅ Get system-wide transaction report (Admin only)
router.get("/system-report", protect, admin, reportController.getSystemReport);

module.exports = router;
