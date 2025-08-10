const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByTag,
  sortTransactionsByTag
} = require("../controllers/transactionController");

const { protect } = require("../middleware/auth"); // Import protect middleware
const admin = require("../middleware/admin"); // Import admin middleware

// Add a new transaction (Protected)
router.post("/add", protect, addTransaction);

// Get all transactions (Admins only)
router.get("/", protect, admin, getAllTransactions);

// Get a single transaction by ID (Protected)
router.get("/:id", protect, getTransactionById);

// Update a transaction (Admins only)
router.put("/:id", protect, admin, updateTransaction);

// Delete a transaction (Admins only)
router.delete("/:id", protect, admin, deleteTransaction);

// Get transactions filtered by tags (Protected)
router.get("/filter/by-tag", protect, getTransactionsByTag);

// Sort transactions by a specific tag (Protected)
router.get("/sort/by-tag", protect, sortTransactionsByTag);

module.exports = router;
