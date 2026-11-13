module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const isConnected = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  return res.status(200).json({
    connected: isConnected,
    user: process.env.SMTP_USER || null,
    adminEmail: process.env.ADMIN_EMAIL || 'jazib7563@gmail.com'
  });
};
