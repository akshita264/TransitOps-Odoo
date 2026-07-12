const Expense = require('../models/Expense');

// GET /api/expenses
exports.getExpenses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.category) filter.category = req.query.category;

    const expenses = await Expense.find(filter)
      .populate('vehicle', 'registrationNumber name type')
      .populate('trip', 'source destination')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/expenses
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    const populated = await Expense.findById(expense._id)
      .populate('vehicle', 'registrationNumber name type');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
