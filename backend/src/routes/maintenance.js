const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenanceLog,
} = require('../controllers/maintenanceController');

router.use(protect);

router.route('/')
  .get(getMaintenanceLogs)
  .post(authorize('fleet_manager', 'dispatcher'), createMaintenanceLog);

router.patch('/:id/close', authorize('fleet_manager', 'dispatcher'), closeMaintenanceLog);

module.exports = router;
