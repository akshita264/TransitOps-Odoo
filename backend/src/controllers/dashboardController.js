const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const MaintenanceLog = require('../models/MaintenanceLog');

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const vehicleFilter = {};
    if (req.query.type) vehicleFilter.type = req.query.type;
    if (req.query.region) vehicleFilter.region = new RegExp(req.query.region, 'i');

    // Vehicle counts
    const totalVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: { $ne: 'Retired' } });
    const activeVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'On Trip' });
    const availableVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'Available' });
    const inMaintenanceVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'In Shop' });
    const retiredVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'Retired' });

    // Trip counts
    const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });
    const pendingTrips = await Trip.countDocuments({ status: 'Draft' });
    const completedTrips = await Trip.countDocuments({ status: 'Completed' });

    // Driver counts
    const driversOnDuty = await Driver.countDocuments({ status: 'On Trip' });
    const availableDrivers = await Driver.countDocuments({ status: 'Available' });
    const totalDrivers = await Driver.countDocuments({ status: { $ne: 'Suspended' } });

    // Fleet utilization
    const fleetUtilization = totalVehicles > 0
      ? Math.round((activeVehicles / totalVehicles) * 100)
      : 0;

    // Recent trips
    const recentTrips = await Trip.find()
      .populate('vehicle', 'registrationNumber name')
      .populate('driver', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Open maintenance
    const openMaintenance = await MaintenanceLog.countDocuments({ status: 'Open' });

    // Vehicles by type
    const vehiclesByType = await Vehicle.aggregate([
      { $match: { status: { $ne: 'Retired' } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Vehicles by status
    const vehiclesByStatus = await Vehicle.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Drivers expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringLicenses = await Driver.countDocuments({
      licenseExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() },
      status: { $ne: 'Suspended' },
    });

    res.json({
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        available: availableVehicles,
        inMaintenance: inMaintenanceVehicles,
        retired: retiredVehicles,
        byType: vehiclesByType,
        byStatus: vehiclesByStatus,
      },
      trips: {
        active: activeTrips,
        pending: pendingTrips,
        completed: completedTrips,
        recent: recentTrips,
      },
      drivers: {
        total: totalDrivers,
        onDuty: driversOnDuty,
        available: availableDrivers,
        expiringLicenses,
      },
      fleetUtilization,
      openMaintenance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
