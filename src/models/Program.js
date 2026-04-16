const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Program title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Worship', 'Prayer', 'Conference', 'Training', 'Outreach', 'Youth', 'Special'],
      default: 'Worship',
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      default: 'TBA',
    },
    location: {
      type: String,
      default: 'Online',
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,  // base64 encoded image string
      default: '',
    },
    upcoming: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

// Index for fast upcoming queries
programSchema.index({ upcoming: 1, date: 1 });

module.exports = mongoose.model('Program', programSchema);
