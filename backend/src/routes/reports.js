const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFuelEfficiency,
  getFleetUtilization,
  getOperationalCost,
  getVehicleROI,
  exportCSV,
} = require('../controllers/reportController');

router.use(protect);

router.get('/fuel-efficiency', getFuelEfficiency);
router.get('/fleet-utilization', getFleetUtilization);
router.get('/operational-cost', getOperationalCost);
router.get('/vehicle-roi', getVehicleROI);
router.get('/export/csv', exportCSV);

module.exports = router;
