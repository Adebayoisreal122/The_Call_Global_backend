const express = require('express');
const router = express.Router();
const {
  getDevotionals,
  getLatestDevotional,
  getDevotional,
  createDevotional,
  deleteDevotional,
} = require('../controllers/devotionalController');
const { protect } = require('../middleware/auth');

// IMPORTANT: /latest must be registered BEFORE /:id
// otherwise Express will try to cast "latest" as a MongoDB ObjectId

// GET  /api/devotionals/latest  — public, homepage banner
router.get('/latest', getLatestDevotional);

// GET  /api/devotionals         — public
// POST /api/devotionals         — admin only
router.route('/')
  .get(getDevotionals)
  .post(protect, createDevotional);

// GET    /api/devotionals/:id   — public
// DELETE /api/devotionals/:id   — admin only
router.route('/:id')
  .get(getDevotional)
  .delete(protect, deleteDevotional);

module.exports = router;
