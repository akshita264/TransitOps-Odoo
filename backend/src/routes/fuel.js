const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getFuelLogs, createFuelLog } = require('../controllers/fuelController');

const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getFuelLogs)
  .post(authorize('fleet_manager', 'dispatcher', 'financial_analyst'), createFuelLog);

module.exports = router;
