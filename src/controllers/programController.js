const Program = require('../models/Program');

/**
 * GET /api/programs
 * Public — returns all programs (optionally filter upcoming)
 */
exports.getPrograms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.upcoming === 'true') filter.upcoming = true;
    if (req.query.type) filter.type = req.query.type;

    const programs = await Program.find(filter).sort({ date: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/programs/:id
 * Public
 */
exports.getProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/programs
 * Protected (admin only)
 */
exports.createProgram = async (req, res, next) => {
  try {
    const program = await Program.create({
      ...req.body,
      createdBy: req.admin._id,
    });
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/programs/:id
 * Protected
 */
exports.updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }
    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/programs/:id
 * Protected
 */
exports.deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found.' });
    }
    res.status(200).json({ success: true, message: 'Program deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
