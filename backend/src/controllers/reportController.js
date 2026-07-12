const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');

const RATE_PER_KM = parseFloat(process.env.RATE_PER_KM) || 15;

// GET /api/reports/fuel-efficiency
exports.getFuelEfficiency = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: { $ne: 'Retired' } });
    const results = [];

    for (const vehicle of vehicles) {
      const trips = await Trip.find({ vehicle: vehicle._id, status: 'Completed' });
      const fuelLogs = await FuelLog.find({ vehicle: vehicle._id });

      const totalDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
      const totalFuel = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
      const efficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : 0;

      results.push({
        vehicleId: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        totalDistance,
        totalFuel,
        efficiency: parseFloat(efficiency),
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/fleet-utilization
exports.getFleetUtilization = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments({ status: { $ne: 'Retired' } });
    const onTrip = await Vehicle.countDocuments({ status: 'On Trip' });
    const available = await Vehicle.countDocuments({ status: 'Available' });
    const inShop = await Vehicle.countDocuments({ status: 'In Shop' });

    const utilization = totalVehicles > 0 ? ((onTrip / totalVehicles) * 100).toFixed(1) : 0;

    // Monthly trip counts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrips = await Trip.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      totalVehicles,
      onTrip,
      available,
      inShop,
      utilization: parseFloat(utilization),
      monthlyTrips,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/operational-cost
exports.getOperationalCost = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const results = [];

    for (const vehicle of vehicles) {
      const fuelLogs = await FuelLog.find({ vehicle: vehicle._id });
      const maintenanceLogs = await MaintenanceLog.find({ vehicle: vehicle._id });
      const expenses = await Expense.find({ vehicle: vehicle._id });

      const fuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
      const maintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
      const otherExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalCost = fuelCost + maintenanceCost + otherExpenses;

      results.push({
        vehicleId: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        fuelCost,
        maintenanceCost,
        otherExpenses,
        totalCost,
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/vehicle-roi
exports.getVehicleROI = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const results = [];

    for (const vehicle of vehicles) {
      const trips = await Trip.find({ vehicle: vehicle._id, status: 'Completed' });
      const fuelLogs = await FuelLog.find({ vehicle: vehicle._id });
      const maintenanceLogs = await MaintenanceLog.find({ vehicle: vehicle._id });

      const totalDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
      const revenue = totalDistance * RATE_PER_KM;
      const fuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
      const maintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
      const totalCost = fuelCost + maintenanceCost;
      const roi = vehicle.acquisitionCost > 0
        ? (((revenue - totalCost) / vehicle.acquisitionCost) * 100).toFixed(2)
        : 0;

      results.push({
        vehicleId: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        acquisitionCost: vehicle.acquisitionCost,
        revenue,
        fuelCost,
        maintenanceCost,
        totalCost,
        profit: revenue - totalCost,
        roi: parseFloat(roi),
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/export/csv
exports.exportCSV = async (req, res) => {
  try {
    const { type } = req.query;
    let data;
    let filename;

    switch (type) {
      case 'vehicles':
        data = await Vehicle.find().lean();
        filename = 'vehicles_report.csv';
        break;
      case 'drivers':
        const Driver = require('../models/Driver');
        data = await Driver.find().lean();
        filename = 'drivers_report.csv';
        break;
      case 'trips':
        data = await Trip.find()
          .populate('vehicle', 'registrationNumber name')
          .populate('driver', 'name')
          .lean();
        data = data.map(t => ({
          ...t,
          vehicleName: t.vehicle?.name || '',
          vehicleReg: t.vehicle?.registrationNumber || '',
          driverName: t.driver?.name || '',
          vehicle: undefined,
          driver: undefined,
        }));
        filename = 'trips_report.csv';
        break;
      case 'fuel':
        data = await FuelLog.find()
          .populate('vehicle', 'registrationNumber name')
          .lean();
        data = data.map(f => ({
          ...f,
          vehicleName: f.vehicle?.name || '',
          vehicleReg: f.vehicle?.registrationNumber || '',
          vehicle: undefined,
        }));
        filename = 'fuel_report.csv';
        break;
      case 'maintenance':
        data = await MaintenanceLog.find()
          .populate('vehicle', 'registrationNumber name')
          .lean();
        data = data.map(m => ({
          ...m,
          vehicleName: m.vehicle?.name || '',
          vehicleReg: m.vehicle?.registrationNumber || '',
          vehicle: undefined,
        }));
        filename = 'maintenance_report.csv';
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type. Use: vehicles, drivers, trips, fuel, maintenance' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No data to export' });
    }

    // Generate CSV
    const headers = Object.keys(data[0]).filter(k => k !== '__v').join(',');
    const rows = data.map(item => {
      return Object.keys(item)
        .filter(k => k !== '__v')
        .map(k => {
          let val = item[k];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') val = JSON.stringify(val);
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',');
    });

    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
