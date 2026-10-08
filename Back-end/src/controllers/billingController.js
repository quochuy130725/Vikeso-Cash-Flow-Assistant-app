const billingService = require('../services/billingService');

/**
 * Controller mỏng: chỉ nhận req, gọi service, trả res.
 * Không query Model trực tiếp.
 */

const toHttpError = (err) => ({
  status: err.statusCode || 500,
  message: err.message || 'Lỗi máy chủ.',
});

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.body.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    const order = await billingService.createOrder(userId);
    return res.status(201).json({ success: true, data: order });
  } catch (err) {
    const e = toHttpError(err);
    return res.status(e.status).json({ success: false, message: e.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const order = await billingService.getOrderStatus(req.params.orderCode);
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    const e = toHttpError(err);
    return res.status(e.status).json({ success: false, message: e.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.query.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId.' });
    const orders = await billingService.getHistory(userId);
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    const e = toHttpError(err);
    return res.status(e.status).json({ success: false, message: e.message });
  }
};
