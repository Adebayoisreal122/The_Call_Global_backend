const mongoose = require('mongoose');

const devotionalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    scripture: {
      type: String,
      required: [true, 'Scripture reference is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: String,
      default: 'Ministry Team',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Faith', 'Prayer', 'Purpose', 'Identity', 'Missions', 'Worship', 'Grace', 'Prophecy'],
      default: 'Faith',
    },
    date: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Devotional', devotionalSchema);
