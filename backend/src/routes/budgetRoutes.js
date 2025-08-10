const express = require('express');
const router = express.Router();
const budgetPlanController = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

// Route to create a new budget plan (No authorization required)
router.post('/create', budgetPlanController.createBudgetPlan);

// Route to get the budget plan of a user (Authorization required)
router.get('/:userId', protect, budgetPlanController.getBudgetPlan);

// Route to add an expense to the budget plan (after an expense transaction) (Authorization required)
router.post('/add-expense', protect, budgetPlanController.addExpense);

// Route to add income to the budget plan (after an income transaction) (Authorization required)
router.post('/add-income', protect, budgetPlanController.addIncome);

// Route to get notifications for a user (Authorization required)
router.get("/notifications/:userId", protect, budgetPlanController.getUserNotifications);

module.exports = router;
