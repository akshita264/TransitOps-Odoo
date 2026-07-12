const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const {
  getTrips,
  getTrip,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require('../controllers/tripController');

router.use(protect);

router.route('/')
  .get(getTrips)
  .post(authorize('fleet_manager', 'dispatcher'), createTrip);

router.get('/:id', getTrip);
router.patch('/:id/dispatch', authorize('fleet_manager', 'dispatcher'), dispatchTrip);
router.patch('/:id/complete', authorize('fleet_manager', 'dispatcher'), completeTrip);
router.patch('/:id/cancel', authorize('fleet_manager', 'dispatcher'), cancelTrip);

module.exports = router;
