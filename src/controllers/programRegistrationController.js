const ProgramRegistration = require('../models/ProgramRegistration');
const { sendProgramRegistrationEmail } = require('../config/email');

/**
 * POST /api/program-registrations
 * Public — visitor registers for a specific program
 */
exports.registerForProgram = async (req, res, next) => {
  try {
    const { programTitle, name, phone, email, gender, age, city, message } = req.body;

    if (!programTitle || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Program, full name and phone number are required.',
      });
    }

    // Save to database first (so we don't lose data if email fails)
    const registration = await ProgramRegistration.create({
      programTitle, name, phone, email, gender, age, city, message,
    });

    // Send email notification — non-blocking (don't fail the request if email fails)
    let emailSent = false;
    try {
      await sendProgramRegistrationEmail({ programTitle, name, phone, email, gender, age, city, message });
      emailSent = true;
      await ProgramRegistration.findByIdAndUpdate(registration._id, { emailSent: true });
    } catch (emailError) {
      // Log but don't crash — the registration is already saved
      console.error('⚠️  Email sending failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: `You have successfully registered for ${programTitle}! ${
        emailSent ? 'A confirmation has been sent to your email.' : 'We will be in touch shortly.'
      }`,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/program-registrations
 * Protected — admin views all registrations
 */
exports.getProgramRegistrations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.program) filter.programTitle = req.query.program;

    const registrations = await ProgramRegistration.find(filter).sort({ createdAt: -1 });

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
 * DELETE /api/program-registrations/:id
 * Protected
 */
exports.deleteProgramRegistration = async (req, res, next) => {
  try {
    const reg = await ProgramRegistration.findByIdAndDelete(req.params.id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }
    res.status(200).json({ success: true, message: 'Registration deleted.' });
  } catch (error) {
    next(error);
  }
};
