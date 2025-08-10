const mongoose = require("mongoose");
const BudgetPlan = require("./Budget"); // Import the BudgetPlan model
const Notification = require("./Notification"); // Import the Notification model

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  type: {
    type: String,
    enum: ["Income", "Expense"],
    required: true
  },

  amount: { type: Number, required: true },

  baseCurrency: { type: String, required: true },  // Default currency (e.g., "USD")
  currencyWanted: { type: String, required: true }, // Target currency (e.g., "LKR")
  exchangeRate: { type: Number, default: 1 }, // Conversion rate to baseCurrency

  expenseType: {
    type: String,
    enum: ["Essential", "Savings & Investments", "Debt Repayment", "Non-Essential"],
    required: function () {
      return this.type === "Expense";
    }
  },

  category: {
    type: String,
    enum: [
      // Essential Expenses
      "Housing", "Utilities", "Groceries", "Healthcare",
      // Savings & Investments
      "Emergency Fund", "Retirement", "Investments",
      // Debt Repayment
      "Credit Card", "Loan Repayment",
      // Non-Essential Expenses
      "Dining Out", "Shopping", "Entertainment", "Travel",
      // Income Categories
      "Salary", "Freelance", "Investments", "Other"
    ],
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Other"],
    required: true
  },

  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },

  // Recurring Transaction Fields
  isRecurring: { type: Boolean, default: false }, // True if this is a recurring transaction
  recurrencePattern: {
    type: String,
    enum: ["Daily", "Weekly", "Monthly"],
    required: function () {
      return this.isRecurring;
    }
  },
  recurrenceEndDate: { type: Date }, // Optional end date for recurrence

  // Custom tags for additional filtering or grouping (optional)
  tags: {
    type: [String],
    default: []
  }
});

// Middleware to auto-update Budget Plan after transaction creation
transactionSchema.post("save", async function (doc, next) {
  try {
    // Find the user's budget plan
    const budgetPlan = await BudgetPlan.findOne({ userId: doc.userId });
    if (!budgetPlan) return next(); // If no budget plan exists, simply continue

    // Convert amount to base currency using exchange rate
    const convertedAmount = doc.amount * doc.exchangeRate;

    if (doc.type === "Income") {
      // Update income and remaining budget for Income transactions
      budgetPlan.totalIncome += convertedAmount;
      budgetPlan.remainingBudget += convertedAmount;
    } else if (doc.type === "Expense") {
      // Look for the expense category in the budget plan
      let expenseCategory = budgetPlan.expenses.find(exp => exp.categoryName === doc.category);
      if (expenseCategory) {
        expenseCategory.spentAmount += convertedAmount;
        expenseCategory.remainingAmount -= convertedAmount;
      } else {
        // If the category doesn't exist in the plan, add it dynamically
        expenseCategory = {
          categoryName: doc.category,
          expenseType: doc.expenseType,
          budgetAmount: 0, // You might want to prompt user or set a default value
          spentAmount: convertedAmount,
          remainingAmount: -convertedAmount
        };
        budgetPlan.expenses.push(expenseCategory);
      }

      // Update overall budget plan amounts
      budgetPlan.totalSpent += convertedAmount;
      budgetPlan.remainingBudget -= convertedAmount;

      // Calculate the spending percentage for this category (only if a budget amount is set)
      if (expenseCategory.budgetAmount > 0) {
        const percentageUsed = (expenseCategory.spentAmount / expenseCategory.budgetAmount) * 100;

        // Create notifications when spending reaches warning or exceed limits
        if (percentageUsed >= 90 && percentageUsed < 100) {
          // Warning notification: spending is close to exceeding (e.g., 90% or more)
          await Notification.create({
            userId: doc.userId,
            message: `⚠️ Warning! Your spending on "${doc.category}" is at ${percentageUsed.toFixed(1)}% of your budget.`
          });
        } else if (percentageUsed >= 100) {
          // Critical notification: spending has exceeded the budget
          await Notification.create({
            userId: doc.userId,
            message: `🚨 Alert! You have exceeded your budget for "${doc.category}".`
          });
        }
      }
    }

    // Handle recurring transactions
    if (doc.isRecurring) {
      const nextTransactionDate = getNextRecurrenceDate(doc.date, doc.recurrencePattern);
      if (nextTransactionDate && (!doc.recurrenceEndDate || nextTransactionDate <= doc.recurrenceEndDate)) {
        await mongoose.model("Transaction").create({
          ...doc.toObject(),
          date: nextTransactionDate,
          _id: mongoose.Types.ObjectId() // Generate a new ID
        });

        // Notify user of upcoming recurring transaction
        await Notification.create({
          userId: doc.userId,
          message: `🔄 Your recurring ${doc.type.toLowerCase()} "${doc.category}" is scheduled for ${nextTransactionDate.toDateString()}.`
        });
      }
    }

    // Save the updated budget plan and continue
    await budgetPlan.save();
    next();
  } catch (error) {
    console.error("Error updating budget plan after transaction:", error);
    next(error);
  }
});

// Helper function to calculate next recurrence date
function getNextRecurrenceDate(currentDate, pattern) {
  const nextDate = new Date(currentDate);
  if (pattern === "Daily") nextDate.setDate(nextDate.getDate() + 1);
  if (pattern === "Weekly") nextDate.setDate(nextDate.getDate() + 7);
  if (pattern === "Monthly") nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
