const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
} = require('../controllers/driverController');

router.use(protect);

router.get('/available', getAvailableDrivers);
router.route('/')
  .get(getDrivers)
  .post(authorize('fleet_manager', 'dispatcher', 'safety_officer'), createDriver);

router.route('/:id')
  .get(getDriver)
  .put(authorize('fleet_manager', 'dispatcher', 'safety_officer'), updateDriver)
  .delete(authorize('fleet_manager'), deleteDriver);

module.exports = router;
