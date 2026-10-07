const billingService = require('../services/billingService');

/**
 * Webhook SePay: trả 200 {success:true} ngay để SePay không retry timeout,
 * xử lý nghiệp vụ async phía sau.
 */
exports.handle = async (req, res) => {
  res.status(200).json({ success: true });
  try {
    await billingService.handleSepayWebhook(req.body);
  } catch (err) {
    console.error('Lỗi xử lý SePay webhook:', err.message);
  }
};
