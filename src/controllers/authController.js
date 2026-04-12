const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Helper: sign a JWT token
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Helper: send token response
const sendTokenResponse = (admin, statusCode, res) => {
  const token = signToken(admin._id);

  res.status(statusCode).json({
    success: true,
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Explicitly select password (it's excluded by default in schema)
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(admin, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Protected — returns the currently logged-in admin
 */
exports.getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password
 * Protected
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both fields are required.' });
    }

    const admin = await Admin.findById(req.admin._id).select('+password');

    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    admin.password = newPassword;
    await admin.save(); // pre-save hook re-hashes

    sendTokenResponse(admin, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/update-profile
 * Protected — update admin name and email
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    // Check if email is taken by another admin
    const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: req.admin._id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'That email is already in use.' });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      { name: name.trim(), email: email.toLowerCase().trim() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};
