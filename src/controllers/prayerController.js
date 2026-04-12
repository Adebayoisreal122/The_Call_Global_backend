const PrayerRequest = require('../models/PrayerRequest');

/**
 * POST /api/prayers
 * Public — anyone can submit a prayer request
 */
exports.submitPrayerRequest = async (req, res, next) => {
  try {
    const { name, email, request } = req.body;

    if (!request || request.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prayer request text is required.',
      });
    }

    const doc = await PrayerRequest.create({ name, email, request });

    res.status(201).json({
      success: true,
      message: "We've received your request and our prayer team is standing with you.",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/prayers
 * Protected — admin only
 */
exports.getPrayerRequests = async (req, res, next) => {
  try {
    const requests = await PrayerRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/prayers/:id/prayed
 * Protected — admin marks request as prayed for
 */
exports.markAsPrayed = async (req, res, next) => {
  try {
    const doc = await PrayerRequest.findByIdAndUpdate(
      req.params.id,
      { isRead: true, prayedBy: req.admin._id },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Prayer request not found.' });
    }

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/prayers/:id
 * Protected
 */
exports.deletePrayerRequest = async (req, res, next) => {
  try {
    const doc = await PrayerRequest.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Prayer request not found.' });
    }

    res.status(200).json({ success: true, message: 'Prayer request deleted.' });
  } catch (error) {
    next(error);
  }
};
