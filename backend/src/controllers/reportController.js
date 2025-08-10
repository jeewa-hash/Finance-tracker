const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// ✅ Get All Transactions for a User
exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all transactions for the user, sorted by date
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    // Calculate totals and categories
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactionAmount = 0;
    const categoryTotals = {};

    transactions.forEach((transaction) => {
      const { amount, type, category } = transaction;

      // Update total transaction amount
      totalTransactionAmount += amount;

      // Update total income and expense based on the type
      if (type === 'income') {
        totalIncome += amount;
      } else if (type === 'expense') {
        totalExpense += amount;
      }

      // Track spending in each category
      if (categoryTotals[category]) {
        categoryTotals[category] += amount;
      } else {
        categoryTotals[category] = amount;
      }
    });

    // Find the category with the highest spending
    const highestSpendingCategory = Object.entries(categoryTotals).reduce(
      (max, [category, total]) => (total > max.total ? { category, total } : max),
      { category: '', total: 0 }
    );

    return res.status(200).json({
      message: "Transactions retrieved successfully",
      data: {
        totalTransactionAmount,
        totalIncome,
        totalExpense,
        highestSpendingCategory,
        categoryTotals,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error while fetching transactions" });
  }
};

// ✅ Get Spending Trends Over Time
exports.getSpendingTrends = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(filter).sort({ date: 1 });

    const trends = transactions.reduce((acc, transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { income: 0, expense: 0 };
      const convertedAmount = transaction.amount * transaction.exchangeRate;
      transaction.type === "Income"
        ? (acc[date].income += convertedAmount)
        : (acc[date].expense += convertedAmount);
      return acc;
    }, {});

    return res.status(200).json({
      message: "Spending trends retrieved successfully",
      data: trends,
    });
  } catch (error) {
    console.error("Error fetching spending trends:", error);
    res.status(500).json({ message: "Server error while fetching trends" });
  }
};

// ✅ Get Income vs. Expenses Summary
exports.getIncomeVsExpense = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const result = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: { $multiply: ["$amount", "$exchangeRate"] } },
        },
      },
    ]);

    let income = 0,
      expense = 0;
    result.forEach((item) => {
      if (item._id === "Income") income = item.totalAmount;
      if (item._id === "Expense") expense = item.totalAmount;
    });

    return res.status(200).json({
      message: "Income vs. Expense data retrieved",
      data: { income, expense },
    });
  } catch (error) {
    console.error("Error fetching income vs. expense:", error);
    res.status(500).json({ message: "Server error while fetching data" });
  }
};

// ✅ Filter Transactions by Time Period, Category, or Tag
exports.filterTransactions = async (req, res) => {
  try {
    const { userId, startDate, endDate, category, tags } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const filter = { userId: new mongoose.Types.ObjectId(userId) };

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) {
      filter.category = category;
    }
    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    return res.status(200).json({
      message: "Filtered transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Error filtering transactions:", error);
    res.status(500).json({ message: "Server error while filtering transactions" });
  }
};



// ✅ Get System-Wide Financial Report
exports.getSystemReport = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: { $multiply: ["$amount", "$exchangeRate"] } },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    result.forEach((item) => {
      if (item._id === "income") totalIncome = item.totalAmount;
      if (item._id === "expense") totalExpense = item.totalAmount;
    });

    // ✅ Calculate Net Profit
    const netProfit = totalIncome - totalExpense;

    // ✅ Group Spending by Category
    const categorySpending = await Transaction.aggregate([
      {
        $match: { type: "expense" }, // Only consider expenses
      },
      {
        $group: {
          _id: "$category",
          totalSpent: { $sum: { $multiply: ["$amount", "$exchangeRate"] } },
        },
      },
      { $sort: { totalSpent: -1 } }, // Sort by highest spending
    ]);

    // ✅ Find the Highest Spending Category
    const highestSpendingCategory =
      categorySpending.length > 0 ? categorySpending[0] : { _id: "N/A", totalSpent: 0 };

    return res.status(200).json({
      message: "System-wide financial report generated",
      data: {
        totalIncome,
        totalExpense,
        netProfit,
        highestSpendingCategory,
        categorySpending,
      },
    });
  } catch (error) {
    console.error("Error generating system report:", error);
    res.status(500).json({ message: "Server error while generating report" });
  }
};

