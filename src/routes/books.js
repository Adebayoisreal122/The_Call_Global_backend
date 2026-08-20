const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  submitPurchase,
  downloadBook,
  checkOrderStatus,
  getAllOrders,
  getOrder,
  approveOrder,
  rejectOrder,
  deleteOrder,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

// ── Public routes ─────────────────────────────────────────────────────────────

// GET  /api/books                         — list all available books
// POST /api/books  (admin)                — create a book
router.route('/')
  .get(getBooks)
  .post(protect, createBook);

// Download via secure token (must be before /:id)
// GET /api/books/download/:token
router.get('/download/:token', downloadBook);

// Check order status by email
// GET /api/books/orders/check?email=&bookId=
router.get('/orders/check', checkOrderStatus);

// ── Admin order routes ────────────────────────────────────────────────────────

// GET /api/books/orders         — admin: all orders
router.route('/orders')
  .get(protect, getAllOrders);

// GET    /api/books/orders/:id          — admin: single order (with proof)
// DELETE /api/books/orders/:id          — admin: delete order
router.route('/orders/:id')
  .get(protect, getOrder)
  .delete(protect, deleteOrder);

// PATCH /api/books/orders/:id/approve   — admin: approve order
router.patch('/orders/:id/approve', protect, approveOrder);

// PATCH /api/books/orders/:id/reject    — admin: reject order
router.patch('/orders/:id/reject', protect, rejectOrder);

// ── Single book routes ────────────────────────────────────────────────────────

// GET    /api/books/:id                 — public: single book
// PUT    /api/books/:id  (admin)        — update book
// DELETE /api/books/:id  (admin)        — delete book
router.route('/:id')
  .get(getBook)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

// POST /api/books/:id/purchase          — public: submit payment proof
router.post('/:id/purchase', submitPurchase);

module.exports = router;
