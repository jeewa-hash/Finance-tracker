const Transaction = require("../models/Transaction");
const { getExchangeRate } = require("../utils/exchangeRate");

// Add a new transaction with exchange rate conversion
const addTransaction = async (req, res) => {
  try {
    const { userId, type, amount, baseCurrency, currencyWanted, category, paymentMethod, expenseType } = req.body;

    // Ensure both baseCurrency and currencyWanted are provided
    if (!baseCurrency || !currencyWanted) {
      return res.status(400).json({ message: "Base currency and target currency are required." });
    }

    // Check if paymentMethod is provided
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required." });
    }

    // If the transaction is of type "Expense", ensure expenseType is provided
    if (type === "Expense" && !expenseType) {
      return res.status(400).json({ message: "Expense type is required for expense transactions." });
    }

    // Get exchange rate for the desired currency
    let exchangeRate;
    try {
      exchangeRate = await getExchangeRate(baseCurrency, currencyWanted);
    } catch (err) {
      return res.status(500).json({ message: "Error fetching exchange rate", error: err.message });
    }

    // Ensure the exchange rate is valid
    if (!exchangeRate || exchangeRate <= 0) {
      return res.status(500).json({ message: "Failed to fetch valid exchange rate." });
    }

    console.log(`Exchange rate fetched: ${exchangeRate}`); // Log the exchange rate

    // Convert the amount to the wanted currency
    const convertedAmount = amount * exchangeRate;
    console.log(`Converted amount: ${convertedAmount}`); // Log the converted amount

    // Create a new transaction document
    const transaction = new Transaction({
      userId,
      type,
      amount: convertedAmount,  // Store amount in the wanted currency
      baseCurrency,
      currencyWanted,
      exchangeRate,
      category,
      paymentMethod, // Include payment method
      expenseType, // Include expenseType if it's an Expense transaction
    });

    // Save the transaction
    await transaction.save();

    res.status(201).json({ message: "Transaction added successfully", data: transaction });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Server error while adding transaction", error: error.message });
  }
};



// Get all transactions for a user (admin-only access)
const getAllTransactions = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const transactions = await Transaction.find().populate("userId", "name email");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transaction", error: error.message });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction", error: error.message });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error: error.message });
  }
};

// Get transactions by tag
const getTransactionsByTag = async (req, res) => {
  const { tags } = req.query;
  
  if (!tags) {
    return res.status(400).json({ message: "No tags provided" });
  }

  const tagArray = tags.split(',');

  try {
    const transactions = await Transaction.find({ tags: { $in: tagArray } });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

// Sort transactions by tag
const sortTransactionsByTag = async (req, res) => {
  const { tag } = req.query;

  if (!tag) {
    return res.status(400).json({ message: "No tag provided" });
  }

  try {
    const transactions = await Transaction.aggregate([
      { $match: { tags: tag } },
      { $sort: { date: -1 } }
    ]);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error sorting transactions", error: error.message });
  }
};

module.exports = {
  addTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsByTag,
  sortTransactionsByTag
};
