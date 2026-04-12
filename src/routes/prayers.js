const express = require('express');
const router = express.Router();
const {
  submitPrayerRequest,
  getPrayerRequests,
  markAsPrayed,
  deletePrayerRequest,
} = require('../controllers/prayerController');
const { protect } = require('../middleware/auth');

// POST /api/prayers          — public: submit prayer request
// GET  /api/prayers          — admin only: view all
router.route('/')
  .post(submitPrayerRequest)
  .get(protect, getPrayerRequests);

// PATCH  /api/prayers/:id/prayed  — admin: mark as prayed for
router.patch('/:id/prayed', protect, markAsPrayed);

// DELETE /api/prayers/:id         — admin
router.delete('/:id', protect, deletePrayerRequest);

module.exports = router;
