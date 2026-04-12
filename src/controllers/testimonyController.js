const Testimony = require('../models/Testimony');

/**
 * GET /api/testimonies
 * Public — returns only approved testimonies
 */
exports.getTestimonies = async (req, res, next) => {
  try {
    const testimonies = await Testimony.find({ approved: true }).sort({ approvedAt: -1 });
    res.status(200).json({ success: true, count: testimonies.length, data: testimonies });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/testimonies/all
 * Protected — returns ALL testimonies including unapproved (for admin)
 */
exports.getAllTestimonies = async (req, res, next) => {
  try {
    const testimonies = await Testimony.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: testimonies.length, data: testimonies });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/testimonies
 * Public — anyone can submit, starts as unapproved
 */
exports.submitTestimony = async (req, res, next) => {
  try {
    const { name, location, text } = req.body;

    if (!name || !text) {
      return res.status(400).json({ success: false, message: 'Name and testimony text are required.' });
    }

    const testimony = await Testimony.create({ name, location, text, approved: false });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your testimony has been submitted for review.',
      data: testimony,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/testimonies/:id/approve
 * Protected — admin approves a testimony
 */
exports.approveTestimony = async (req, res, next) => {
  try {
    const testimony = await Testimony.findByIdAndUpdate(
      req.params.id,
      {
        approved: true,
        approvedBy: req.admin._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!testimony) {
      return res.status(404).json({ success: false, message: 'Testimony not found.' });
    }

    res.status(200).json({ success: true, data: testimony });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/testimonies/:id
 * Protected
 */
exports.deleteTestimony = async (req, res, next) => {
  try {
    const testimony = await Testimony.findByIdAndDelete(req.params.id);
    if (!testimony) {
      return res.status(404).json({ success: false, message: 'Testimony not found.' });
    }
    res.status(200).json({ success: true, message: 'Testimony deleted.' });
  } catch (error) {
    next(error);
  }
};
