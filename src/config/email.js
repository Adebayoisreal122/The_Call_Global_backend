const nodemailer = require('nodemailer');
const Admin = require('../models/Admin');
/**
 * Creates and returns a nodemailer transporter.
 * Uses Gmail by default. For other providers update the service/host fields.
 *
 * Gmail setup:
 * 1. Go to your Google Account → Security → 2-Step Verification → turn ON
 * 2. Then go to Security → App Passwords
 * 3. Select "Mail" and "Windows Computer" → Generate
 * 4. Copy the 16-character password into your .env as EMAIL_PASS
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // Gmail App Password (not your login password)
    },
  });
};

/**
 * Send program registration email to the admin.
 * Called when a visitor registers for a specific ministry program.
 */
const sendProgramRegistrationEmail = async ({
  programTitle,
  name,
  email,
  phone,
  gender,
  age,
  city,
  message,
}) => {
  const transporter = createTransporter();

    const admin = await Admin.findOne().select('email');

  if (!admin || !admin.email) {
    throw new Error('Admin email not found in database');
  }

  const adminEmail = admin.email;

  console.log("📧 Sending admin email to:", adminEmail);

  // ── Email to Admin ────────────────────────────────────────────────────────
  const adminMailOptions = {
    from: `"The Call Global Website" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `📋 New Program Registration — ${programTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #0a1a6b, #1e3db5); padding: 32px 36px; text-align: center; }
          .header img { width: 60px; height: 60px; border-radius: 50%; margin-bottom: 12px; }
          .header h1 { color: #fff; font-size: 22px; margin: 0 0 4px; }
          .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 0; }
          .badge { display: inline-block; background: rgba(255,255,255,0.15); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-top: 12px; border: 1px solid rgba(255,255,255,0.25); }
          .body { padding: 32px 36px; }
          .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #1e3db5; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e8eeff; }
          .field { margin-bottom: 14px; }
          .field-label { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
          .field-value { font-size: 15px; color: #1a1a2e; font-weight: 500; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
          .message-box { background: #f8f9ff; border: 1px solid #e0e7ff; border-radius: 10px; padding: 14px 16px; font-size: 14px; color: #444; line-height: 1.6; margin-top: 4px; }
          .footer { background: #f8f9ff; padding: 20px 36px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
          .timestamp { font-size: 12px; color: #aaa; text-align: right; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Program Registration</h1>
            <p>Someone has registered for a ministry program</p>
            <div class="badge">📋 ${programTitle}</div>
          </div>
          <div class="body">
            <div class="section-title">Personal Information</div>
            <div class="grid">
              <div class="field">
                <div class="field-label">Full Name</div>
                <div class="field-value">${name}</div>
              </div>
              <div class="field">
                <div class="field-label">Gender</div>
                <div class="field-value">${gender || 'Not specified'}</div>
              </div>
              <div class="field">
                <div class="field-label">Age / Age Range</div>
                <div class="field-value">${age || 'Not specified'}</div>
              </div>
              <div class="field">
                <div class="field-label">City / Country</div>
                <div class="field-value">${city || 'Not specified'}</div>
              </div>
            </div>

            <div class="section-title" style="margin-top:20px">Contact Details</div>
            <div class="grid">
              <div class="field">
                <div class="field-label">Phone / WhatsApp</div>
                <div class="field-value">${phone}</div>
              </div>
              <div class="field">
                <div class="field-label">Email Address</div>
                <div class="field-value">${email || 'Not provided'}</div>
              </div>
            </div>

            ${message ? `
            <div class="section-title" style="margin-top:20px">Additional Message</div>
            <div class="message-box">${message}</div>
            ` : ''}

            <div class="timestamp">Submitted on ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</div>
          </div>
          <div class="footer">
            The Call Global Ministry Website · Auto-generated notification
          </div>
        </div>
      </body>
      </html>
    `,
  };

  // ── Confirmation Email to Registrant (if email provided) ──────────────────
  if (email) {
    const confirmMailOptions = {
      from: `"The Call Global Ministry" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Registration Confirmed — ${programTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #0a1a6b, #1e3db5); padding: 36px; text-align: center; }
            .header h1 { color: #fff; font-size: 24px; margin: 0 0 8px; }
            .header p { color: rgba(255,255,255,0.75); margin: 0; font-size: 14px; }
            .body { padding: 36px; }
            .program-badge { background: #e8eeff; color: #1e3db5; border-radius: 10px; padding: 14px 18px; text-align: center; margin-bottom: 24px; }
            .program-badge .label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #888; }
            .program-badge .title { font-size: 20px; font-weight: 700; color: #0a1a6b; margin-top: 4px; }
            p { color: #444; line-height: 1.7; font-size: 15px; }
            .footer { background: #f8f9ff; padding: 20px 36px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
            .social-links { margin: 16px 0; }
            .social-links a { color: #1e3db5; text-decoration: none; margin: 0 8px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Registered! 🎉</h1>
              <p>Welcome to The Call Global Ministry</p>
            </div>
            <div class="body">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for registering for one of our ministry programs. We are excited to have you join us!</p>

              <div class="program-badge">
                <div class="label">You registered for</div>
                <div class="title">${programTitle}</div>
              </div>

              <p>Our team will reach out to you shortly on <strong>${phone}</strong> with details about your next steps, schedules and materials.</p>

              <p>In the meantime, stay connected with us:</p>
              <div class="social-links">
                <a href="https://t.me/Thecall023">Telegram</a> ·
                <a href="https://instagram.com/thecallglobal">Instagram</a> ·
                <a href="https://facebook.com/thecallglobal">Facebook</a> ·
                <a href="https://youtube.com/@thecallglobal">YouTube</a>
              </div>

              <p style="margin-top:24px">God bless you,<br/><strong>The Call Global Ministry Team</strong></p>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} The Call Global Ministry · Built for His Glory
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(confirmMailOptions);
  }

  // Send admin email
  await transporter.sendMail(adminMailOptions);
};

/**
 * Send general contact message to admin inbox
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"The Call Global Website" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    replyTo: email || process.env.EMAIL_USER,
    subject: `✉️ Contact Message: ${subject || 'No Subject'}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#0a1a6b,#1e3db5);padding:28px 32px">
          <h2 style="color:#fff;margin:0">New Contact Message</h2>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px">Via The Call Global website contact form</p>
        </div>
        <div style="padding:28px 32px">
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
          <div style="background:#f8f9ff;border-left:3px solid #1e3db5;padding:14px 16px;border-radius:0 8px 8px 0;margin-top:12px">
            <p style="margin:0;color:#333;line-height:1.7">${message}</p>
          </div>
          <p style="font-size:12px;color:#aaa;margin-top:24px">Sent on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendProgramRegistrationEmail, sendContactEmail };
