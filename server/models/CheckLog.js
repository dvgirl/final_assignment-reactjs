const mongoose = require('mongoose');

const checkLogSchema = new mongoose.Schema(
  {
    pass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pass',
      required: true,
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    checkInTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    gate: {
      type: String,
      default: 'Main Entrance - Gate 1',
    },
    belongings: {
      type: String,
      default: 'None / Standard Bag',
    },
    laptopSerialNumber: {
      type: String,
      default: '',
    },
    temperature: {
      type: String,
      default: '98.4 °F',
    },
    status: {
      type: String,
      enum: ['CheckedIn', 'CheckedOut'],
      default: 'CheckedIn',
    },
    remarks: {
      type: String,
      default: 'Entry cleared normally',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CheckLog', checkLogSchema);
