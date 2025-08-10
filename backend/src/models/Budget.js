const mongoose = require("mongoose");

// Define Expense Category Schema for dynamic categories in the budget
const expenseCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },    // Name of the category (e.g., Groceries, Rent)
  expenseType: { type: String, enum: ["Essential", "Savings & Investments", "Debt Repayment", "Non-Essential"], required: true },  // Type of the expense
  budgetAmount: { type: Number, required: true },     // Initial budget amount for the category
  spentAmount: { type: Number, default: 0 },         // Amount spent so far
  remainingAmount: { type: Number, required: true },  // Remaining amount in the category
});

const budgetPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Total income and budget calculations
  totalIncome: { type: Number, required: true },      // Total income (sum of all incomes)
  totalSpent: { type: Number, default: 0 },           // Total spent so far
  remainingBudget: { type: Number, required: true },  // Remaining budget after spending

  // Expenses Categories (Essential, Savings, Debt Repayment, Non-Essential)
  expenses: [expenseCategorySchema],                  // Array of expense categories and their amounts

  createdAt: { type: Date, default: Date.now },       // When the budget plan was created
  updatedAt: { type: Date, default: Date.now },       // When the budget plan was last updated
});

// Pre-save hook to ensure the remaining budget is accurate
budgetPlanSchema.pre("save", function (next) {
  let totalExpenses = 0;
  
  // Calculate total expenses from the categories
  this.expenses.forEach(expense => {
    totalExpenses += expense.spentAmount;
  });

  // Update the total spent and remaining budget
  this.totalSpent = totalExpenses;
  this.remainingBudget = this.totalIncome - totalExpenses;

  this.updatedAt = Date.now();  // Update the timestamp when budget is modified

  next();
});

// Method to add expenses dynamically and update the remaining budget
budgetPlanSchema.methods.addExpense = function (category, amount) {
  const expenseCategory = this.expenses.find(exp => exp.categoryName === category);

  if (expenseCategory) {
    expenseCategory.spentAmount += amount;
    expenseCategory.remainingAmount -= amount;
  }

  this.totalSpent += amount;
  this.remainingBudget -= amount;

  return this.save();
};

// Method to add income and update the remaining budget
budgetPlanSchema.methods.addIncome = function (amount) {
  this.totalIncome += amount;
  this.remainingBudget += amount;

  return this.save();
};

// Create and export the BudgetPlan model
const BudgetPlan = mongoose.model("BudgetPlan", budgetPlanSchema);
module.exports = BudgetPlan;
