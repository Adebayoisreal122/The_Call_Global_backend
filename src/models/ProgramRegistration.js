const mongoose = require('mongoose');

const programRegistrationSchema = new mongoose.Schema(
  {
    programTitle: {
      type: String,
      required: [true, 'Program title is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Prefer not to say', ''],
      default: '',
    },
    age: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

programRegistrationSchema.index({ programTitle: 1, createdAt: -1 });

module.exports = mongoose.model('ProgramRegistration', programRegistrationSchema);
