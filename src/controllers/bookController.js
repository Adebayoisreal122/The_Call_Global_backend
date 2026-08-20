const crypto = require('crypto');
const Book = require('../models/Book');
const BookOrder = require('../models/BookOrder');

// ── BOOKS (Admin + Public) ────────────────────────────────────────────────────

/**
 * GET /api/books
 * Public — returns all available books (without PDF data for listing)
 */
exports.getBooks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available !== 'false') filter.isAvailable = true;

    // Never send PDF file in listing — only send cover image + metadata
    const books = await Book.find(filter)
      .select('-pdfFile')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/books/:id
 * Public — single book (no PDF)
 */
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('-pdfFile');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/books
 * Protected — admin creates a book
 */
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create({ ...req.body, createdBy: req.admin._id });
    // Return without PDF in response
    const bookObj = book.toObject();
    delete bookObj.pdfFile;
    res.status(201).json({ success: true, data: bookObj });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/books/:id
 * Protected — admin updates a book
 */
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-pdfFile');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/books/:id
 * Protected — admin deletes a book
 */
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    // Also delete all orders for this book
    await BookOrder.deleteMany({ bookId: req.params.id });
    res.status(200).json({ success: true, message: 'Book and its orders deleted.' });
  } catch (error) {
    next(error);
  }
};

// ── ORDERS ────────────────────────────────────────────────────────────────────

/**
 * POST /api/books/:id/purchase
 * Public — buyer submits purchase request with payment proof
 */
exports.submitPurchase = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('-pdfFile');
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (!book.isAvailable) return res.status(400).json({ success: false, message: 'This book is currently unavailable.' });

    const { buyerName, buyerEmail, buyerPhone, paymentProof, paymentProofFileName } = req.body;

    if (!buyerName || !buyerEmail) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }
    if (!paymentProof) {
      return res.status(400).json({ success: false, message: 'Payment proof is required.' });
    }

    // Check if this email already has a pending/approved order for this book
    const existing = await BookOrder.findOne({
      bookId: book._id,
      buyerEmail: buyerEmail.toLowerCase(),
      status: { $in: ['pending', 'approved'] },
    });
    if (existing) {
      if (existing.status === 'approved') {
        return res.status(409).json({
          success: false,
          message: 'You already have an approved purchase for this book. Check your email for the download link.',
        });
      }
      return res.status(409).json({
        success: false,
        message: 'You already have a pending order for this book. Please wait for admin approval.',
      });
    }

    const order = await BookOrder.create({
      bookId: book._id,
      bookTitle: book.title,
      bookPrice: book.price,
      buyerName,
      buyerEmail,
      buyerPhone,
      paymentProof,
      paymentProofFileName: paymentProofFileName || 'proof.jpg',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Your payment proof has been submitted! The admin will review and approve your purchase within 24 hours. You will receive a download link by email once approved.',
      data: {
        orderId: order._id,
        bookTitle: book.title,
        status: 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/books/download/:token
 * Public — buyer downloads the PDF using a secure token
 */
exports.downloadBook = async (req, res, next) => {
  try {
    const { token } = req.params;

    const order = await BookOrder.findOne({
      downloadToken: token,
      status: 'approved',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired download link.',
      });
    }

    // Check token expiry (30 days)
    if (order.downloadTokenExpiry && new Date() > order.downloadTokenExpiry) {
      return res.status(410).json({
        success: false,
        message: 'This download link has expired. Please contact the ministry.',
      });
    }

    // Get the book with PDF
    const book = await Book.findById(order.bookId);
    if (!book || !book.pdfFile) {
      return res.status(404).json({ success: false, message: 'Book file not found.' });
    }

    // Increment download count
    await BookOrder.findByIdAndUpdate(order._id, { $inc: { downloadCount: 1 } });

    // Return the base64 PDF and filename
    res.status(200).json({
      success: true,
      data: {
        pdf: book.pdfFile,
        fileName: book.pdfFileName || `${book.title}.pdf`,
        bookTitle: book.title,
        downloadCount: order.downloadCount + 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/books/orders/check?email=&bookId=
 * Public — buyer checks their order status by email
 */
exports.checkOrderStatus = async (req, res, next) => {
  try {
    const { email, bookId } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const filter = { buyerEmail: email.toLowerCase() };
    if (bookId) filter.bookId = bookId;

    const orders = await BookOrder.find(filter)
      .select('-paymentProof') // don't resend the large proof image
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// ── ADMIN ORDER MANAGEMENT ────────────────────────────────────────────────────

/**
 * GET /api/books/orders
 * Protected — admin gets all orders
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const orders = await BookOrder.find(filter)
      .populate('bookId', 'title price coverImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/books/orders/:id
 * Protected — admin gets single order WITH payment proof
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await BookOrder.findById(req.params.id)
      .populate('bookId', 'title price coverImage');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/books/orders/:id/approve
 * Protected — admin approves an order and generates a download token
 */
exports.approveOrder = async (req, res, next) => {
  try {
    const order = await BookOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Order is already approved.' });
    }

    // Generate a secure random download token
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const downloadTokenExpiry = new Date();
    downloadTokenExpiry.setDate(downloadTokenExpiry.getDate() + 30); // 30 days

    const updated = await BookOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        downloadToken,
        downloadTokenExpiry,
        approvedAt: new Date(),
        approvedBy: req.admin._id,
        adminNote: req.body.adminNote || '',
      },
      { new: true }
    );

    // Increment book total sales
    await Book.findByIdAndUpdate(order.bookId, { $inc: { totalSales: 1 } });

    // The download link the buyer will use:
    const downloadLink = `${process.env.CLIENT_URL}/books/download/${downloadToken}`;

    res.status(200).json({
      success: true,
      message: `Order approved. Download link generated.`,
      data: {
        order: updated,
        downloadLink,
        downloadToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/books/orders/:id/reject
 * Protected — admin rejects an order
 */
exports.rejectOrder = async (req, res, next) => {
  try {
    const order = await BookOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        adminNote: req.body.adminNote || 'Payment could not be verified.',
        approvedBy: req.admin._id,
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/books/orders/:id
 * Protected
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await BookOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.status(200).json({ success: true, message: 'Order deleted.' });
  } catch (error) {
    next(error);
  }
};
