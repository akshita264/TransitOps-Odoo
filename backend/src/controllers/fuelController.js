const FuelLog = require('../models/FuelLog');

// GET /api/fuel
exports.getFuelLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;

    const logs = await FuelLog.find(filter)
      .populate('vehicle', 'registrationNumber name type')
      .populate('trip', 'source destination status')
      .sort({ date: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/fuel
exports.createFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.create(req.body);
    const populated = await FuelLog.findById(log._id)
      .populate('vehicle', 'registrationNumber name type');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
