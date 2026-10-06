const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide the visitor full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide the visitor email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide the visitor phone number'],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
      default: 'Self / Independent',
    },
    idType: {
      type: String,
      enum: ['Aadhaar Card', 'Driving License', 'Passport', 'Voter ID', 'Employee ID', 'Government ID', 'Other'],
      default: 'Driving License',
    },
    idNumber: {
      type: String,
      trim: true,
      default: '',
    },
    photo: {
      type: String, // Base64 data URL or image path
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Linked user account if visitor signed up
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visitor', visitorSchema);
