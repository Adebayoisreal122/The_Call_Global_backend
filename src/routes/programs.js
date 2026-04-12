const express = require('express');
const router = express.Router();
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} = require('../controllers/programController');
const { protect } = require('../middleware/auth');

// GET  /api/programs          — public (supports ?upcoming=true)
// POST /api/programs          — admin only
router.route('/')
  .get(getPrograms)
  .post(protect, createProgram);

// GET    /api/programs/:id    — public
// PUT    /api/programs/:id    — admin only
// DELETE /api/programs/:id    — admin only
router.route('/:id')
  .get(getProgram)
  .put(protect, updateProgram)
  .delete(protect, deleteProgram);

module.exports = router;
