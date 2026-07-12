const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenanceLog,
  deleteMaintenanceLog,
} = require('../controllers/maintenanceController');

router.use(protect);

router.route('/')
  .get(getMaintenanceLogs)
  .post(authorize('fleet_manager', 'dispatcher'), createMaintenanceLog);

router.patch('/:id/close', authorize('fleet_manager', 'dispatcher'), closeMaintenanceLog);
router.delete('/:id', authorize('fleet_manager', 'dispatcher'), deleteMaintenanceLog);

module.exports = router;
