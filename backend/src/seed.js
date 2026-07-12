const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const MaintenanceLog = require('./models/MaintenanceLog');
const FuelLog = require('./models/FuelLog');
const Expense = require('./models/Expense');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Trip.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      FuelLog.deleteMany({}),
      Expense.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create Users (one per role)
    const users = await User.create([
      { name: 'Admin Manager', email: 'fleet@transitops.com', password: 'password123', role: 'fleet_manager' },
      { name: 'John Dispatcher', email: 'dispatch@transitops.com', password: 'password123', role: 'dispatcher' },
      { name: 'Sarah Safety', email: 'safety@transitops.com', password: 'password123', role: 'safety_officer' },
      { name: 'Mike Finance', email: 'finance@transitops.com', password: 'password123', role: 'financial_analyst' },
    ]);
    console.log(`Created ${users.length} users`);

    // Create Vehicles
    const vehicles = await Vehicle.create([
      { registrationNumber: 'VAN-01', name: 'Mercedes Sprinter', type: 'Van', maxLoadCapacity: 1200, odometer: 45000, acquisitionCost: 35000, status: 'Available', region: 'North' },
      { registrationNumber: 'VAN-02', name: 'Ford Transit', type: 'Van', maxLoadCapacity: 1000, odometer: 32000, acquisitionCost: 28000, status: 'Available', region: 'South' },
      { registrationNumber: 'TRK-01', name: 'Volvo FH16', type: 'Truck', maxLoadCapacity: 25000, odometer: 120000, acquisitionCost: 95000, status: 'Available', region: 'North' },
      { registrationNumber: 'TRK-02', name: 'Scania R500', type: 'Truck', maxLoadCapacity: 20000, odometer: 85000, acquisitionCost: 88000, status: 'Available', region: 'East' },
      { registrationNumber: 'BUS-01', name: 'Volvo 9700', type: 'Bus', maxLoadCapacity: 5000, odometer: 200000, acquisitionCost: 150000, status: 'Available', region: 'West' },
      { registrationNumber: 'CAR-01', name: 'Toyota Camry', type: 'Car', maxLoadCapacity: 400, odometer: 15000, acquisitionCost: 25000, status: 'Available', region: 'South' },
      { registrationNumber: 'VAN-03', name: 'Renault Master', type: 'Van', maxLoadCapacity: 1500, odometer: 67000, acquisitionCost: 30000, status: 'Available', region: 'East' },
      { registrationNumber: 'TRK-03', name: 'MAN TGX', type: 'Truck', maxLoadCapacity: 30000, odometer: 150000, acquisitionCost: 110000, status: 'Retired', region: 'North' },
      { registrationNumber: 'VAN-05', name: 'Fiat Ducato', type: 'Van', maxLoadCapacity: 500, odometer: 22000, acquisitionCost: 22000, status: 'Available', region: 'West' },
      { registrationNumber: 'CAR-02', name: 'Honda Civic', type: 'Car', maxLoadCapacity: 350, odometer: 8000, acquisitionCost: 20000, status: 'Available', region: 'North' },
    ]);
    console.log(`Created ${vehicles.length} vehicles`);

    // Create Drivers
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    
    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 15);

    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() - 1);

    const drivers = await Driver.create([
      { name: 'Alex Johnson', licenseNumber: 'DL-001', licenseCategory: 'CE', licenseExpiry: futureDate, contact: '+1-555-0101', safetyScore: 95, status: 'Available' },
      { name: 'Maria Garcia', licenseNumber: 'DL-002', licenseCategory: 'C', licenseExpiry: futureDate, contact: '+1-555-0102', safetyScore: 92, status: 'Available' },
      { name: 'James Wilson', licenseNumber: 'DL-003', licenseCategory: 'DE', licenseExpiry: futureDate, contact: '+1-555-0103', safetyScore: 88, status: 'Available' },
      { name: 'Emma Brown', licenseNumber: 'DL-004', licenseCategory: 'B', licenseExpiry: futureDate, contact: '+1-555-0104', safetyScore: 97, status: 'Available' },
      { name: 'Robert Davis', licenseNumber: 'DL-005', licenseCategory: 'CE', licenseExpiry: nearExpiryDate, contact: '+1-555-0105', safetyScore: 78, status: 'Available' },
      { name: 'Lisa Anderson', licenseNumber: 'DL-006', licenseCategory: 'C', licenseExpiry: futureDate, contact: '+1-555-0106', safetyScore: 85, status: 'Off Duty' },
      { name: 'David Miller', licenseNumber: 'DL-007', licenseCategory: 'B', licenseExpiry: expiredDate, contact: '+1-555-0107', safetyScore: 60, status: 'Suspended' },
      { name: 'Sophie Taylor', licenseNumber: 'DL-008', licenseCategory: 'C', licenseExpiry: futureDate, contact: '+1-555-0108', safetyScore: 91, status: 'Available' },
    ]);
    console.log(`Created ${drivers.length} drivers`);

    // Create some completed trips with fuel logs
    const trip1 = await Trip.create({
      source: 'New York',
      destination: 'Boston',
      vehicle: vehicles[0]._id,
      driver: drivers[0]._id,
      cargoWeight: 800,
      plannedDistance: 350,
      actualDistance: 360,
      fuelConsumed: 45,
      status: 'Completed',
      createdBy: users[1]._id,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const trip2 = await Trip.create({
      source: 'Los Angeles',
      destination: 'San Francisco',
      vehicle: vehicles[2]._id,
      driver: drivers[1]._id,
      cargoWeight: 15000,
      plannedDistance: 615,
      actualDistance: 620,
      fuelConsumed: 120,
      status: 'Completed',
      createdBy: users[1]._id,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    const trip3 = await Trip.create({
      source: 'Chicago',
      destination: 'Detroit',
      vehicle: vehicles[1]._id,
      driver: drivers[2]._id,
      cargoWeight: 600,
      plannedDistance: 450,
      actualDistance: 455,
      fuelConsumed: 55,
      status: 'Completed',
      createdBy: users[0]._id,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // Create a dispatched trip (vehicle & driver On Trip)
    vehicles[3].status = 'On Trip';
    await vehicles[3].save();
    drivers[3].status = 'On Trip';
    await drivers[3].save();

    await Trip.create({
      source: 'Houston',
      destination: 'Dallas',
      vehicle: vehicles[3]._id,
      driver: drivers[3]._id,
      cargoWeight: 12000,
      plannedDistance: 385,
      status: 'Dispatched',
      createdBy: users[1]._id,
      dispatchedAt: new Date(),
    });

    // Create a draft trip
    await Trip.create({
      source: 'Seattle',
      destination: 'Portland',
      vehicle: vehicles[5]._id,
      driver: drivers[4]._id,
      cargoWeight: 200,
      plannedDistance: 280,
      status: 'Draft',
      createdBy: users[0]._id,
    });

    console.log('Created 5 trips');

    // Create fuel logs
    await FuelLog.create([
      { vehicle: vehicles[0]._id, trip: trip1._id, liters: 45, cost: 67.5, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[2]._id, trip: trip2._id, liters: 120, cost: 180, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[1]._id, trip: trip3._id, liters: 55, cost: 82.5, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[0]._id, liters: 30, cost: 45, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[4]._id, liters: 80, cost: 120, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('Created 5 fuel logs');

    // Create maintenance logs (one open = vehicle In Shop)
    vehicles[6].status = 'In Shop';
    await vehicles[6].save();

    await MaintenanceLog.create([
      { vehicle: vehicles[0]._id, description: 'Regular oil change and filter replacement', type: 'Oil Change', cost: 150, status: 'Closed', closedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[2]._id, description: 'Brake pad replacement - front axle', type: 'Brake Service', cost: 450, status: 'Closed', closedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[6]._id, description: 'Engine overhaul and coolant flush', type: 'Engine Repair', cost: 2500, status: 'Open' },
      { vehicle: vehicles[4]._id, description: 'All tires replaced with new set', type: 'Tire Replacement', cost: 1200, status: 'Closed', closedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('Created 4 maintenance logs');

    // Create expenses
    await Expense.create([
      { vehicle: vehicles[0]._id, trip: trip1._id, category: 'Toll', description: 'I-95 tolls', amount: 35, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[2]._id, trip: trip2._id, category: 'Toll', description: 'CA highway tolls', amount: 25, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[1]._id, category: 'Insurance', description: 'Monthly insurance premium', amount: 200, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[0]._id, category: 'Parking', description: 'Overnight parking at depot', amount: 50, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { vehicle: vehicles[4]._id, category: 'Other', description: 'Vehicle cleaning service', amount: 75, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    ]);
    console.log('Created 5 expenses');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Fleet Manager:      fleet@transitops.com / password123');
    console.log('Dispatcher:         dispatch@transitops.com / password123');
    console.log('Safety Officer:     safety@transitops.com / password123');
    console.log('Financial Analyst:  finance@transitops.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
