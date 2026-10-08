const sepayConfig = require('../config/sepay');
const sepayService = require('./sepayService');
const SubscriptionOrder = require('../models/SubscriptionOrder');
const User = require('../models/User');
const { getIO } = require('../socket');

/**
 * Billing service — nơi DUY NHẤT chạm DB cho thanh toán.
 * Controller chỉ gọi các hàm này, không query Model trực tiếp.
 */

const createOrder = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng.');
    err.statusCode = 404;
    throw err;
  }

  const existing = await SubscriptionOrder.findOne({
    userId, status: 'PENDING', expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
  if (existing) return existing;

  const orderCode = sepayService.makeOrderCode();
  const transferContent = sepayService.makeTransferContent(orderCode);
  const qrUrl = sepayConfig.buildQrUrl({ amount: sepayConfig.proPrice, content: transferContent });
  const expiresAt = new Date(Date.now() + sepayConfig.qrExpireMinutes * 60 * 1000);

  return SubscriptionOrder.create({
    userId, orderCode, plan: 'PRO', amount: sepayConfig.proPrice,
    status: 'PENDING', transferContent, qrUrl, expiresAt,
  });
};

const getOrderStatus = async (orderCode) => {
  const order = await SubscriptionOrder.findOne({ orderCode });
  if (!order) {
    const err = new Error('Không tìm thấy đơn hàng.');
    err.statusCode = 404;
    throw err;
  }
  if (order.status === 'PENDING' && order.expiresAt < new Date()) {
    order.status = 'EXPIRED';
    await order.save();
  }
  return order;
};

const getHistory = async (userId) =>
  SubscriptionOrder.find({ userId }).sort({ createdAt: -1 }).limit(50);

/**
 * Xử lý payload webhook SePay. Idempotent theo sepayTransactionId.
 * Payload mẫu: { id, gateway, transferType, transferAmount, content, code }
 */
const handleSepayWebhook = async (payload) => {
  if (!payload || payload.transferType !== 'in') {
    console.log(`⚠️ SePay webhook bỏ qua: transferType=${payload?.transferType} id=${payload?.id}`);
    return { ignored: true };
  }

  if (payload.id != null) {
    const dup = await SubscriptionOrder.findOne({ sepayTransactionId: payload.id });
    if (dup) {
      console.log(`🔁 SePay webhook trùng: sepayId=${payload.id} order=${dup.orderCode}`);
      return { duplicate: true, order: dup };
    }
  }

  const orderCode = sepayService.parseOrderCode(payload.content, payload.code);
  if (!orderCode) {
    console.log(`⚠️ SePay webhook không có mã VIKESO: id=${payload.id} content="${payload.content}" code="${payload.code}" amount=${payload.transferAmount}`);
    return { ignored: true, reason: 'NO_ORDER_CODE' };
  }

  const order = await SubscriptionOrder.findOne({ orderCode });
  if (!order) {
    console.log(`⚠️ SePay webhook sai orderCode: ${orderCode} id=${payload.id}`);
    return { ignored: true, reason: 'ORDER_NOT_FOUND' };
  }
  if (order.status !== 'PENDING') return { duplicate: true, order };
  if (order.expiresAt < new Date()) {
    order.status = 'EXPIRED';
    order.rawWebhook = payload;
    await order.save();
    return { expired: true, order };
  }
  if (!sepayService.isAmountEnough(payload.transferAmount)) {
    order.status = 'FAILED';
    order.rawWebhook = payload;
    if (payload.id != null) order.sepayTransactionId = payload.id;
    await order.save();
    return { failed: true, reason: 'INSUFFICIENT_AMOUNT', order };
  }

  order.status = 'SUCCESS';
  order.paidAt = new Date();
  order.gateway = payload.gateway || '';
  order.rawWebhook = payload;
  if (payload.id != null) order.sepayTransactionId = payload.id;
  await order.save();

  const now = new Date();
  const base = new Date();
  await User.updateOne(
    { _id: order.userId },
    {
      $set: {
        subscriptionPlan: 'PRO',
        proStartedAt: now,
        proExpiresAt: new Date(base.getTime() + sepayConfig.proDays * 24 * 60 * 60 * 1000),
      },
    }
  );

  try {
    getIO().emit('subscription_upgraded', { userId: String(order.userId), plan: 'PRO', orderCode });
  } catch (_) {}

  return { success: true, order };
};

const expireOverdueOrders = async () =>
  SubscriptionOrder.updateMany(
    { status: 'PENDING', expiresAt: { $lt: new Date() } },
    { $set: { status: 'EXPIRED' } }
  );

const downgradeExpiredPro = async () =>
  User.updateMany(
    { subscriptionPlan: 'PRO', proExpiresAt: { $ne: null, $lt: new Date() } },
    { $set: { subscriptionPlan: 'FREE' } }
  );

module.exports = {
  createOrder, getOrderStatus, getHistory,
  handleSepayWebhook, expireOverdueOrders, downgradeExpiredPro,
};
