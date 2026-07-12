const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Vehicle name/model is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Van', 'Truck', 'Bus', 'Car', 'Motorcycle'],
    required: [true, 'Vehicle type is required'],
  },
  maxLoadCapacity: {
    type: Number,
    required: [true, 'Maximum load capacity is required'],
    min: [0, 'Capacity must be positive'],
  },
  odometer: {
    type: Number,
    default: 0,
    min: 0,
  },
  acquisitionCost: {
    type: Number,
    required: [true, 'Acquisition cost is required'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available',
  },
  region: {
    type: String,
    trim: true,
    default: 'Default',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
