const Driver = require('../models/Driver');

// GET /api/drivers
exports.getDrivers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.licenseCategory) filter.licenseCategory = req.query.licenseCategory;
    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { licenseNumber: new RegExp(req.query.search, 'i') },
      ];
    }

    const drivers = await Driver.find(filter).sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/drivers/:id
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/drivers
exports.createDriver = async (req, res) => {
  try {
    const { licenseNumber } = req.body;

    const existing = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Driver with this license number already exists' });
    }

    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/drivers/:id
exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (req.body.licenseNumber && req.body.licenseNumber !== driver.licenseNumber) {
      const existing = await Driver.findOne({ licenseNumber: req.body.licenseNumber.toUpperCase() });
      if (existing) {
        return res.status(400).json({ message: 'License number already in use' });
      }
    }

    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/drivers/:id
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    if (driver.status === 'On Trip') {
      return res.status(400).json({ message: 'Cannot delete a driver that is currently on a trip' });
    }

    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/drivers/available
exports.getAvailableDrivers = async (req, res) => {
  try {
    const today = new Date();
    const drivers = await Driver.find({
      status: 'Available',
      licenseExpiry: { $gte: today },
    }).sort({ name: 1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
