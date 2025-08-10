const BudgetPlan = require('../models/Budget'); // Import the Budget Plan model
const Transaction = require('../models/Transaction'); // Import the Transaction model
const Notification = require('../models/Notification');

// Create a new budget plan for a user
exports.createBudgetPlan = async (req, res) => {
  try {
    const { userId, totalIncome, expenses } = req.body;

    const newBudgetPlan = new BudgetPlan({
      userId,
      totalIncome,
      totalSpent: 0,
      remainingBudget: totalIncome,
      expenses
    });

    await newBudgetPlan.save();
    res.status(201).json({
      message: 'Budget Plan created successfully',
      data: newBudgetPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating budget plan', error });
  }
};

// Get the budget plan for a user
exports.getBudgetPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const budgetPlan = await BudgetPlan.findOne({ userId });

    if (!budgetPlan) {
      return res.status(404).json({ message: 'Budget plan not found' });
    }

    res.status(200).json({
      message: 'Budget Plan retrieved successfully',
      data: budgetPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving budget plan', error });
  }
};

// Add an expense to the budget plan (called after a transaction)

exports.addExpense = async (req, res) => {
  try {
    const { userId, amount, category } = req.body;

    const budgetPlan = await BudgetPlan.findOne({ userId });

    if (!budgetPlan) {
      return res.status(404).json({ message: "Budget plan not found" });
    }

    const expenseCategory = budgetPlan.expenses.find(
      (expense) => expense.categoryName === category
    );

    if (!expenseCategory) {
      return res.status(404).json({ message: "Expense category not found" });
    }

    // Update the expense and remaining amount
    expenseCategory.spentAmount += amount;
    expenseCategory.remainingAmount -= amount;

    budgetPlan.totalSpent += amount;
    budgetPlan.remainingBudget -= amount;

    await budgetPlan.save();

    // === 🔔 Send Notifications Based on Budget Thresholds ===
    const budgetUsage = (expenseCategory.spentAmount / expenseCategory.budgetAmount) * 100;

    let notificationMessage = "";

    if (budgetUsage >= 80 && budgetUsage < 100) {
      notificationMessage = `⚠️ Warning: You have spent 80% of your ${category} budget!`;
    } else if (budgetUsage >= 100) {
      notificationMessage = `❌ Alert: You have exceeded your ${category} budget by $${Math.abs(expenseCategory.remainingAmount)}!`;
    }

    if (notificationMessage) {
      const newNotification = new Notification({
        userId,
        message: notificationMessage,
      });

      await newNotification.save();
    }

    res.status(200).json({
      message: "Expense added successfully",
      data: budgetPlan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding expense", error });
  }
};


// Add an income to the budget plan (called after an income transaction)
exports.addIncome = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const budgetPlan = await BudgetPlan.findOne({ userId });

    if (!budgetPlan) {
      return res.status(404).json({ message: 'Budget plan not found' });
    }

    // Update income and remaining budget
    budgetPlan.totalIncome += amount;
    budgetPlan.remainingBudget += amount;

    await budgetPlan.save();

    res.status(200).json({
      message: 'Income added successfully',
      data: budgetPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding income', error });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Notifications retrieved successfully",
      data: notifications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving notifications", error });
  }
};
