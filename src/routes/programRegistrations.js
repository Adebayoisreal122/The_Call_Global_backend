const express = require('express');
const router = express.Router();
const {
  registerForProgram,
  getProgramRegistrations,
  deleteProgramRegistration,
} = require('../controllers/programRegistrationController');
const { protect } = require('../middleware/auth');

// POST /api/program-registrations       — public: register for a program
// GET  /api/program-registrations       — admin: view all
router.route('/')
  .post(registerForProgram)
  .get(protect, getProgramRegistrations);

// DELETE /api/program-registrations/:id — admin
router.delete('/:id', protect, deleteProgramRegistration);

module.exports = router;
