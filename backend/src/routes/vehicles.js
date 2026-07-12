const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
} = require('../controllers/vehicleController');

router.use(protect);

router.get('/available', getAvailableVehicles);
router.route('/')
  .get(getVehicles)
  .post(authorize('fleet_manager', 'dispatcher'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('fleet_manager', 'dispatcher'), updateVehicle)
  .delete(authorize('fleet_manager'), deleteVehicle);

module.exports = router;
