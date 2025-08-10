# Finance-tracker

Personal Finance Tracker API
Overview
This is a Personal Expense Tracker API built with Node.js, Express, MongoDB, and JWT authentication.
It enables users to register, log in, manage income & expenses, set budgets, and track financial activities.

Features
✅ User authentication (Register & Login)
✅ Admin authentication
✅ Income & Expense tracking
✅ Recurring transactions
✅ JWT-based authentication
✅ Secure password hashing with bcrypt
✅ Email notifications for user registration
✅ CRUD operations for financial transactions
✅ Role-based access control (Admin/User)
✅ Goal tracking with notifications
✅ Multi-currency support

📌 Installation & Setup
1️⃣ Clone the Repository
All API END POINTS

User Authentication

router.post('/register', registerUser); router.post('/login', loginUser); router.get('/profile', protect, getProfile); router.get('/admin/users', protect, admin, getAllUsers); router.get('/admin/users/:id', protect, admin, getUserById); router.put('/admin/users/:id', protect, admin, updateUser); router.delete('/admin/users/:id', protect, admin, deleteUser);

Transaction router.post("/add", addTransaction); router.get("/", getAllTransactions); router.get("/:id", getTransactionById); router.put("/:id", updateTransaction); router.delete("/:id", deleteTransaction); router.get("/filter/by-tag", getTransactionsByTag); router.get("/sort/by-tag", sortTransactionsByTag);

Goals router.post('/', protect, addGoal); router.get('/', protect, getGoals); router.put('/:id', protect, updateGoal); router.delete('/:id', protect, deleteGoal);

Budget Management router.post('/create', budgetPlanController.createBudgetPlan); router.get('/:userId', budgetPlanController.getBudgetPlan); router.post('/add-expense', budgetPlanController.addExpense); router.post('/add-income', budgetPlanController.addIncome); router.get("/notifications/:userId", budgetPlanController.getUserNotifications);

Notifications router.get('/', protect, async (req, res) => { try { console.log("User ID:", req.user._id); // Debugging

const notifications = await Notification.find({ userId: req.user._id }).sort({ date: -1 });

console.log("Fetched Notifications:", notifications); // Debugging

res.status(200).json(notifications);
} catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); } });

Environmant Variables PORT=4000 MONGO_URI=mongodb+srv://jkumarasekara:fK1ATJ6ZH8FzSUxn@cluster0.r8qz3.mongodb.net/ JWT_SECRET=520b475465319bd7cb8db2a4b5257a68b9c0e53688fbd3a8d6a42001e9b88a718ae2b5c1e397a2baa9f4fea8e2e0db46f8b3dfba53c942d41ce57dfc95b81b37

Testing Part npm test
