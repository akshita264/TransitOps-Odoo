const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['Oil Change', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'Transmission', 'Electrical', 'Body Work', 'General Service', 'Other'],
    required: [true, 'Maintenance type is required'],
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
  closedAt: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
