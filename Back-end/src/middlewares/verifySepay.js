const sepayConfig = require('../config/sepay');

/**
 * Xác thực webhook SePay bằng API-Key.
 * SePay gửi: Authorization: Apikey <API_KEY> (giữ x-api-key để test Postman).
 */
const verifySepay = (req, res, next) => {
  if (!sepayConfig.webhookApiKey) {
    return res.status(500).json({ success: false, message: 'Chưa cấu hình SEPAY_WEBHOOK_API_KEY.' });
  }
  const auth = req.headers['authorization'] || '';
  const m = auth.match(/^apikey\s+(.+)$/i);
  const key = (m ? m[1].trim() : '') || req.headers['x-api-key'] || req.headers['x-sepay-key'];
  if (key !== sepayConfig.webhookApiKey) {
    return res.status(401).json({ success: false, message: 'Sai SePay API key.' });
  }
  next();
};

module.exports = verifySepay;
