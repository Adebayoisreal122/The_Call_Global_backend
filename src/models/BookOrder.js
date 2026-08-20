const mongoose = require('mongoose');

const bookOrderSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    bookTitle: {
      type: String,
      required: true,
    },
    bookPrice: {
      type: Number,
      required: true,
    },
    // Buyer details
    buyerName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    buyerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    // Payment proof (base64 image or PDF of bank receipt/screenshot)
    paymentProof: {
      type: String, // base64 encoded image
      required: [true, 'Payment proof is required'],
    },
    paymentProofFileName: {
      type: String,
      default: 'proof.jpg',
    },
    // Order status workflow:
    // pending → approved (admin approves) → buyer can download
    // pending → rejected (admin rejects)
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Unique download token generated on approval
    downloadToken: {
      type: String,
      default: '',
    },
    downloadTokenExpiry: {
      type: Date,
    },
    // Admin notes (e.g. reason for rejection)
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    // How many times the buyer downloaded after approval
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

bookOrderSchema.index({ status: 1, createdAt: -1 });
bookOrderSchema.index({ buyerEmail: 1 });
bookOrderSchema.index({ downloadToken: 1 });

module.exports = mongoose.model('BookOrder', bookOrderSchema);
