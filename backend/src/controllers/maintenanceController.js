const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

// GET /api/maintenance
exports.getMaintenanceLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicle) filter.vehicle = req.query.vehicle;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const logs = await MaintenanceLog.find(filter)
      .populate('vehicle', 'registrationNumber name type status')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/maintenance
exports.createMaintenanceLog = async (req, res) => {
  try {
    const { vehicle: vehicleId } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Business Rule: Cannot create maintenance for vehicle that is On Trip
    if (vehicle.status === 'On Trip') {
      return res.status(400).json({
        message: 'Cannot create maintenance record for a vehicle currently on a trip',
      });
    }

    // Business Rule: Creating maintenance automatically sets vehicle to In Shop
    vehicle.status = 'In Shop';
    await vehicle.save();

    const log = await MaintenanceLog.create(req.body);

    const populated = await MaintenanceLog.findById(log._id)
      .populate('vehicle', 'registrationNumber name type status');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/maintenance/:id/close
exports.closeMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Maintenance log not found' });
    }
    if (log.status === 'Closed') {
      return res.status(400).json({ message: 'Maintenance log is already closed' });
    }

    log.status = 'Closed';
    log.closedAt = new Date();
    if (req.body && req.body.cost) log.cost = req.body.cost;
    await log.save();

    // Business Rule: Closing maintenance restores vehicle to Available (unless Retired)
    const vehicle = await Vehicle.findById(log.vehicle);
    if (vehicle && vehicle.status !== 'Retired') {
      // Check if there are other open maintenance records for this vehicle
      const openLogs = await MaintenanceLog.countDocuments({
        vehicle: vehicle._id,
        status: 'Open',
        _id: { $ne: log._id },
      });

      if (openLogs === 0) {
        vehicle.status = 'Available';
        await vehicle.save();
      }
    }

    const populated = await MaintenanceLog.findById(log._id)
      .populate('vehicle', 'registrationNumber name type status');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/maintenance/:id
exports.deleteMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Maintenance log not found' });
    }

    const vehicleId = log.vehicle;
    const wasOpen = log.status === 'Open';

    await MaintenanceLog.findByIdAndDelete(req.params.id);

    if (wasOpen && vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle && vehicle.status === 'In Shop') {
        const openLogs = await MaintenanceLog.countDocuments({
          vehicle: vehicleId,
          status: 'Open',
        });
        if (openLogs === 0) {
          vehicle.status = 'Available';
          await vehicle.save();
        }
      }
    }

    res.json({ message: 'Maintenance log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

