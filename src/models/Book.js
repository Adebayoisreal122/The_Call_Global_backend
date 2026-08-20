const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['Faith', 'Prayer', 'Leadership', 'Purpose', 'Healing', 'Prophecy', 'Devotional', 'Biography', 'Other'],
      default: 'Faith',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    coverImage: {
      type: String, // base64 encoded image
      default: '',
    },
    pdfFile: {
      type: String, // base64 encoded PDF
      required: [true, 'PDF file is required'],
    },
    pdfFileName: {
      type: String,
      default: 'book.pdf',
    },
    pages: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    // Bank account details for payment
    paymentAccountName: {
      type: String,
      trim: true,
      default: '',
    },
    paymentAccountNumber: {
      type: String,
      trim: true,
      default: '',
    },
    paymentBankName: {
      type: String,
      trim: true,
      default: '',
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  { timestamps: true }
);

bookSchema.index({ isAvailable: 1, createdAt: -1 });
bookSchema.index({ category: 1 });

module.exports = mongoose.model('Book', bookSchema);
