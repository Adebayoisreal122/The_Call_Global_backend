const mongoose = require('mongoose');

const testimonySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    text: {
      type: String,
      required: [true, 'Testimony text is required'],
      trim: true,
    },
    approved: {
      type: Boolean,
      default: false, // admin must approve before it goes public
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

testimonySchema.index({ approved: 1, createdAt: -1 });

module.exports = mongoose.model('Testimony', testimonySchema);
