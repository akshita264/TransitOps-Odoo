const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required'],
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver is required'],
  },
  cargoWeight: {
    type: Number,
    required: [true, 'Cargo weight is required'],
    min: [0, 'Cargo weight must be positive'],
  },
  plannedDistance: {
    type: Number,
    required: [true, 'Planned distance is required'],
    min: [0, 'Distance must be positive'],
  },
  actualDistance: {
    type: Number,
    default: 0,
    min: 0,
  },
  fuelConsumed: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dispatchedAt: Date,
  completedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Trip', tripSchema);
