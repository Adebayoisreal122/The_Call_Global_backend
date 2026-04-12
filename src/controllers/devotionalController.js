const Devotional = require('../models/Devotional');

/**
 * GET /api/devotionals
 * Public — newest first
 */
exports.getDevotionals = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const [devotionals, total] = await Promise.all([
      Devotional.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Devotional.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: devotionals.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: devotionals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/devotionals/latest
 * Public — returns single latest devotional (for homepage banner)
 */
exports.getLatestDevotional = async (req, res, next) => {
  try {
    const devotional = await Devotional.findOne().sort({ createdAt: -1 });
    if (!devotional) {
      return res.status(404).json({ success: false, message: 'No devotionals found.' });
    }
    res.status(200).json({ success: true, data: devotional });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/devotionals/:id
 * Public
 */
exports.getDevotional = async (req, res, next) => {
  try {
    const devotional = await Devotional.findById(req.params.id);
    if (!devotional) {
      return res.status(404).json({ success: false, message: 'Devotional not found.' });
    }
    res.status(200).json({ success: true, data: devotional });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/devotionals
 * Protected
 */
exports.createDevotional = async (req, res, next) => {
  try {
    const devotional = await Devotional.create({
      ...req.body,
      createdBy: req.admin._id,
    });
    res.status(201).json({ success: true, data: devotional });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/devotionals/:id
 * Protected
 */
exports.deleteDevotional = async (req, res, next) => {
  try {
    const devotional = await Devotional.findByIdAndDelete(req.params.id);
    if (!devotional) {
      return res.status(404).json({ success: false, message: 'Devotional not found.' });
    }
    res.status(200).json({ success: true, message: 'Devotional deleted.' });
  } catch (error) {
    next(error);
  }
};
