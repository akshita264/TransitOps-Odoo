const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['Toll', 'Maintenance', 'Insurance', 'Parking', 'Fine', 'Other'],
    required: [true, 'Category is required'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
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

module.exports = mongoose.model('Expense', expenseSchema);
