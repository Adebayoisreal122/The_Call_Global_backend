const express = require('express');
const router = express.Router();
const {
  getTestimonies,
  getAllTestimonies,
  submitTestimony,
  approveTestimony,
  deleteTestimony,
} = require('../controllers/testimonyController');
const { protect } = require('../middleware/auth');

// IMPORTANT: /all must come before /:id

// GET /api/testimonies/all — admin: returns ALL including unapproved
router.get('/all', protect, getAllTestimonies);

// GET  /api/testimonies    — public: approved only
// POST /api/testimonies    — public: submit a testimony
router.route('/')
  .get(getTestimonies)
  .post(submitTestimony);

// PATCH  /api/testimonies/:id/approve  — admin: approve
router.patch('/:id/approve', protect, approveTestimony);

// DELETE /api/testimonies/:id          — admin
router.delete('/:id', protect, deleteTestimony);

module.exports = router;
