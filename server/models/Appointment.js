const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visitor',
      required: [true, 'Appointment must be linked to a visitor'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must have a host employee'],
    },
    purpose: {
      type: String,
      required: [true, 'Please specify the visit purpose'],
      default: 'Official Visit',
      trim: true,
    },
    customPurpose: {
      type: String,
      default: '',
    },
    visitDate: {
      type: Date,
      required: [true, 'Please specify the scheduled visit date'],
    },
    visitTime: {
      type: String,
      required: [true, 'Please specify scheduled time (e.g. 10:30 AM)'],
      default: '10:00 AM',
    },
    expectedDuration: {
      type: String,
      default: '1 Hour',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    remarks: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    invitationType: {
      type: String,
      enum: ['HostInvited', 'VisitorPreRegistered', 'WalkInFrontDesk'],
      default: 'VisitorPreRegistered',
    },
    location: {
      type: String,
      default: 'Headquarters - Main Campus, Building A',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
