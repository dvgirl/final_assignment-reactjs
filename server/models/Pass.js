const mongoose = require('mongoose');

const passSchema = new mongoose.Schema(
  {
    passCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    qrCode: {
      type: String, // Base64 data URL for scanning
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'CheckedIn', 'Completed', 'Expired', 'Revoked'],
      default: 'Active',
    },
    gateNumber: {
      type: String,
      default: 'Main Entrance - Gate 1',
    },
    location: {
      type: String,
      default: 'TechCorp HQ - Main Building',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    badgeColor: {
      type: String,
      default: '#2563eb', // Blue for normal visitor, gold for VIP, green for contractor
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pass', passSchema);
