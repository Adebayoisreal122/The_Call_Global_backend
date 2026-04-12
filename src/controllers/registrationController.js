const Registration = require('../models/Registration');

/**
 * POST /api/registrations
 * Public — visitor joins the ministry
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, country, interest } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email address are required.',
      });
    }

    // Check for duplicate email
    const existing = await Registration.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already registered. Welcome back to The Call Global!',
      });
    }

    const reg = await Registration.create({ name, email, phone, country, interest });

    res.status(201).json({
      success: true,
      message: 'Welcome to The Call Global! We will be in touch with next steps.',
      data: reg,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/registrations
 * Protected — admin only
 */
exports.getRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/registrations/:id
 * Protected
 */
exports.deleteRegistration = async (req, res, next) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    res.status(200).json({ success: true, message: 'Registration removed.' });
  } catch (error) {
    next(error);
  }
};
