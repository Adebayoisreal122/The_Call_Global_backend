const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    request: {
      type: String,
      required: [true, 'Prayer request is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false, // admin can mark as prayed for
    },
    prayedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

prayerRequestSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
