const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required'],
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null,
  },
  liters: {
    type: Number,
    required: [true, 'Liters is required'],
    min: [0, 'Liters must be positive'],
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: 0,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FuelLog', fuelLogSchema);
