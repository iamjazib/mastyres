const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const user = (payload.smtp_user || '').trim();
    const pass = (payload.smtp_pass || '').replace(/\s+/g, '');

    if (!user || !pass) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your Gmail address and 16-character App Password.'
      });
    }

    const testTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    await testTransporter.verify();

    return res.status(200).json({
      success: true,
      message: 'Gmail credentials verified successfully! Red table design & PDF attachments are now active.'
    });

  } catch (err) {
    console.error('[SMTP VERIFICATION ERROR]', err.message);
    return res.status(400).json({
      success: false,
      message: 'Google login failed: ' + (err.message || 'Invalid credentials') + '. Please ensure 2-Step Verification is ON and your 16-character App Password is correct.'
    });
  }
};
