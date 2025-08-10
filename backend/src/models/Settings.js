const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  categories: {
    type: [String],
    enum: [
      // 🌟 Essential Expenses
      "Housing - Rent/Mortgage", "Housing - Maintenance", "Housing - Property Tax",
      "Utilities - Electricity", "Utilities - Water", "Utilities - Internet", "Utilities - Gas",
      "Groceries - Supermarket", "Groceries - Fruits & Vegetables", "Groceries - Meat & Dairy",
      "Healthcare - Doctor Visits", "Healthcare - Medications", "Healthcare - Insurance",

      // 💰 Savings & Investments
      "Emergency Fund", "Retirement Savings", "Stock Investments", "Mutual Funds", "Cryptocurrency",

      // 💳 Debt Repayment
      "Credit Card - Bill Payment", "Credit Card - Minimum Payment",
      "Loan Repayment - Student Loan", "Loan Repayment - Car Loan", "Loan Repayment - Home Loan",

      // 🎉 Non-Essential Expenses
      "Dining Out - Restaurants", "Dining Out - Coffee Shops",
      "Shopping - Clothing", "Shopping - Electronics", "Shopping - Gifts",
      "Entertainment - Movies", "Entertainment - Games", "Entertainment - Events",
      "Travel - Flights", "Travel - Hotels", "Travel - Transport",

      // 🏦 Income Sources
      "Salary - Primary Job", "Salary - Part-time Job", "Freelance Work",
      "Business Income", "Stock Dividends", "Other Passive Income"
    ],
    required: true
  },

  limits: {
    transactionLimit: { type: Number, default: 10000 }, // Default limit per transaction
    monthlyLimit: { type: Number, default: 50000 },     // Default monthly spending limit
  }
});

module.exports = mongoose.model("Settings", settingsSchema);
