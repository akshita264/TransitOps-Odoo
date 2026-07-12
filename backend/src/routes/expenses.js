const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getExpenses, createExpense } = require('../controllers/expenseController');

const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(authorize('fleet_manager', 'dispatcher', 'financial_analyst'), createExpense);

module.exports = router;
