const Vehicle = require('../models/Vehicle');
const MaintenanceLog = require('../models/MaintenanceLog');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

// GET /api/vehicles
exports.getVehicles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.region) filter.region = new RegExp(req.query.region, 'i');
    if (req.query.search) {
      filter.$or = [
        { registrationNumber: new RegExp(req.query.search, 'i') },
        { name: new RegExp(req.query.search, 'i') },
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vehicles/:id
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const existing = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Vehicle with this registration number already exists' });
    }

    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Don't allow changing registration number to an existing one
    if (req.body.registrationNumber && req.body.registrationNumber !== vehicle.registrationNumber) {
      const existing = await Vehicle.findOne({ registrationNumber: req.body.registrationNumber.toUpperCase() });
      if (existing) {
        return res.status(400).json({ message: 'Registration number already in use' });
      }
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ message: 'Cannot delete a vehicle that is currently on a trip' });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    await Promise.all([
      MaintenanceLog.deleteMany({ vehicle: req.params.id }),
      Trip.deleteMany({ vehicle: req.params.id }),
      FuelLog.deleteMany({ vehicle: req.params.id }),
      Expense.deleteMany({ vehicle: req.params.id }),
    ]);
    res.json({ message: 'Vehicle and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vehicles/available
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: 'Available' }).sort({ name: 1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
