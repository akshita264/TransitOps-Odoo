const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const FuelLog = require('../models/FuelLog');

// GET /api/trips
exports.getTrips = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.driver) filter.driver = req.query.driver;

    const trips = await Trip.find(filter)
      .populate('vehicle', 'registrationNumber name type maxLoadCapacity')
      .populate('driver', 'name licenseNumber contact')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/trips/:id
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver')
      .populate('createdBy', 'name email');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/trips  (creates as Draft)
exports.createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle: vehicleId, driver: driverId, cargoWeight, plannedDistance } = req.body;

    // Validate vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Validate driver exists
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Validate cargo weight against vehicle capacity
    if (cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacity} kg)`,
      });
    }

    const trip = await Trip.create({
      source,
      destination,
      vehicle: vehicleId,
      driver: driverId,
      cargoWeight,
      plannedDistance,
      createdBy: req.user._id,
      status: 'Draft',
    });

    const populated = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber name type')
      .populate('driver', 'name licenseNumber');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/trips/:id/dispatch
exports.dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft trips can be dispatched' });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    // Business Rule: Vehicle must be Available
    if (!vehicle || vehicle.status !== 'Available') {
      return res.status(400).json({
        message: `Vehicle is not available (current status: ${vehicle ? vehicle.status : 'not found'})`,
      });
    }

    // Business Rule: Retired or In Shop vehicles must not appear in dispatch
    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
      return res.status(400).json({
        message: `Vehicle cannot be dispatched — status is ${vehicle.status}`,
      });
    }

    // Business Rule: Driver must be Available
    if (!driver || driver.status !== 'Available') {
      return res.status(400).json({
        message: `Driver is not available (current status: ${driver ? driver.status : 'not found'})`,
      });
    }

    // Business Rule: Driver license must not be expired
    if (new Date(driver.licenseExpiry) < new Date()) {
      return res.status(400).json({
        message: `Driver's license has expired (expiry: ${driver.licenseExpiry.toISOString().split('T')[0]})`,
      });
    }

    // Business Rule: Driver must not be Suspended
    if (driver.status === 'Suspended') {
      return res.status(400).json({
        message: 'Suspended drivers cannot be assigned to trips',
      });
    }

    // Business Rule: Cargo weight must not exceed vehicle capacity
    if (trip.cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)`,
      });
    }

    // Dispatch: update statuses
    vehicle.status = 'On Trip';
    driver.status = 'On Trip';
    trip.status = 'Dispatched';
    trip.dispatchedAt = new Date();

    await vehicle.save();
    await driver.save();
    await trip.save();

    const populated = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber name type status')
      .populate('driver', 'name licenseNumber status');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/trips/:id/complete
exports.completeTrip = async (req, res) => {
  try {
    const { actualDistance, fuelConsumed, finalOdometer } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only Dispatched trips can be completed' });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    // Update trip
    trip.status = 'Completed';
    trip.actualDistance = actualDistance || trip.plannedDistance;
    trip.fuelConsumed = fuelConsumed || 0;
    trip.completedAt = new Date();

    // Restore statuses
    if (vehicle) {
      vehicle.status = 'Available';
      if (finalOdometer) vehicle.odometer = finalOdometer;
      await vehicle.save();
    }
    if (driver) {
      driver.status = 'Available';
      await driver.save();
    }

    await trip.save();

    // Auto-create fuel log if fuel was consumed
    if (fuelConsumed && fuelConsumed > 0) {
      await FuelLog.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        liters: fuelConsumed,
        cost: fuelConsumed * 1.5, // default cost per liter, can be overridden
        date: new Date(),
      });
    }

    const populated = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber name type status')
      .populate('driver', 'name licenseNumber status');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/trips/:id/cancel
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.status !== 'Dispatched' && trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft or Dispatched trips can be cancelled' });
    }

    // If dispatched, restore vehicle and driver
    if (trip.status === 'Dispatched') {
      const vehicle = await Vehicle.findById(trip.vehicle);
      const driver = await Driver.findById(trip.driver);

      if (vehicle && vehicle.status === 'On Trip') {
        vehicle.status = 'Available';
        await vehicle.save();
      }
      if (driver && driver.status === 'On Trip') {
        driver.status = 'Available';
        await driver.save();
      }
    }

    trip.status = 'Cancelled';
    await trip.save();

    const populated = await Trip.findById(trip._id)
      .populate('vehicle', 'registrationNumber name type status')
      .populate('driver', 'name licenseNumber status');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
