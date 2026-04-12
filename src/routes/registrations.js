const express = require('express');
const router = express.Router();
const {
  register,
  getRegistrations,
  deleteRegistration,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

// POST /api/registrations    — public: join the ministry
// GET  /api/registrations    — admin only
router.route('/')
  .post(register)
  .get(protect, getRegistrations);

// DELETE /api/registrations/:id  — admin
router.delete('/:id', protect, deleteRegistration);

module.exports = router;
