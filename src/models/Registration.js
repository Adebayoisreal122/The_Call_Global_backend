const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    interest: {
      type: String,
      trim: true,
      default: 'General Member',
    },
  },
  { timestamps: true }
);

// Prevent duplicate emails
registrationSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
