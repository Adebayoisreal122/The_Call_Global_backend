const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  — verify token & return current admin
router.get('/me', protect, getMe);

// PUT /api/auth/update-profile — update name and email
router.put('/update-profile', protect, updateProfile);

// PUT /api/auth/change-password
router.put('/change-password', protect, changePassword);

module.exports = router;
